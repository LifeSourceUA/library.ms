import Prepare from 'common/utils/prepareModel';

module.exports = function(Periodical) {
    Periodical.TYPE_MAGAZINE = 'magazine';
    Periodical.TYPE_NEWSPAPER = 'newspaper';
    Periodical.types = [,
        Periodical.TYPE_MAGAZINE,
        Periodical.TYPE_NEWSPAPER
    ];

    Prepare(Periodical);

    Periodical.toPublic = (periodical) => {
        return periodical;
    };

    /**
     * POST /
     */
    Periodical.remoteMethod('createOne', {
        http: { verb: 'post', path: '/' },
        accepts: {
            arg: 'data',
            type: 'object',
            http: { source: 'body' }
        },
        returns: {
            arg: 'data',
            type: 'Periodical',
            root: true
        }
    });
    Periodical.createOne = async (data) => {
        const periodical = new Periodical(data);

        await Periodical.create(periodical);

        return periodical;
    };
    Periodical.afterRemote('createOne', async (ctx, periodical) => {
        ctx.result = Periodical.toPublic(periodical);
        ctx.res.statusCode = 201;
    });

    /**
     * GET /
     */
    Periodical.remoteMethod('getAll', {
        http: { verb: 'get', path: '/' },
        accepts: [
            { arg: 'type', type: 'string' },
            { arg: 'limit', type: 'number' },
            { arg: 'offset', type: 'number' }
        ],
        returns: { type: 'Object', root: true }
    });
    Periodical.beforeRemote('getAll', async (ctx) => {
        /**
         * Arguments validation
         */
        // Limit
        let limit = ctx.args.limit;
        if (!limit || limit <= 0) {
            limit = 10;
        }
        if (limit > 100) {
            limit = 100;
        }
        ctx.args.limit = limit;

        // Offset
        let offset = ctx.args.offset;
        if (!offset || offset < 0) {
            offset = 0;
        }
        ctx.args.offset = offset;
    });
    Periodical.getAll = async (type = null, limit, offset) => {
        if (Periodical.types.indexOf(type) === -1) {
            const error = new Error('Type is not defined');
            error.statusCode = 400;
            throw error;
        }

        const results =  await Promise.all([
            Periodical.find({
                where: { type },
                offset,
                limit
            }),
            Periodical.count()
        ]);

        return {
            periodicals: results[0],
            meta: {
                limit,
                offset,
                total: results[1]
            }
        };
    };
    Periodical.afterRemote('getAll', async (ctx) => {
        if (ctx.result && Array.isArray(ctx.result.periodicals)) {
            ctx.result.periodicals.forEach(Periodical.toPublic);
        }

        if (ctx.result.meta.total === 0) {
            ctx.res.statusCode = 404;
        }
    });

    /**
     * PUT /{id}
     */
    Periodical.remoteMethod('updateOne', {
        http: { verb: 'put', path: '/:id' },
        accepts: [
            { arg: 'id', type: 'String' },
            {
                arg: 'data',
                type: 'object',
                http: { source: 'body' }
            }
        ],
        returns: {
            arg: 'data',
            type: 'Periodical',
            root: true
        }
    });
    Periodical.updateOne = async (id, data) => {
        const periodical = await Periodical.findById(id);

        if (periodical === null) {
            const error = new Error('Not found');
            error.statusCode = 404;
            throw error;
        }

        await periodical.updateAttributes(data);

        return periodical;
    };

    /**
     * GET /{id}/issues
     */
    Periodical.remoteMethod('getIssues', {
        http: { verb: 'get', path: '/:id/issues' },
        accepts: [
            { arg: 'id', type: 'String' },
            { arg: 'limit', type: 'number' },
            { arg: 'offset', type: 'number' }
        ],
        returns: { type: 'Object', root: true }
    });
    Periodical.beforeRemote('getIssues', async (ctx) => {
        /**
         * Arguments validation
         */
        // Limit
        let limit = ctx.args.limit;
        if (!limit || limit <= 0) {
            limit = 10;
        }
        if (limit > 100) {
            limit = 100;
        }
        ctx.args.limit = limit;

        // Offset
        let offset = ctx.args.offset;
        if (!offset || offset < 0) {
            offset = 0;
        }
        ctx.args.offset = offset;
    });
    Periodical.getIssues = async (id, limit, offset) => {
        const periodical = await Periodical.findById(id);

        if (periodical === null) {
            const error = new Error('Not found');
            error.statusCode = 404;
            throw error;
        }

        const PeriodicalIssue = Periodical.app.models.PeriodicalIssue;

        const where = { periodicalId: periodical.id };
        const results =  await Promise.all([
            PeriodicalIssue.find({
                where,
                offset,
                limit
            }),
            PeriodicalIssue.count(where)
        ]);

        return {
            issues: results[0],
            periodical,
            meta: {
                limit,
                offset,
                total: results[1]
            }
        };
    };

    /**
     * POST /{id}/issues
     */
    Periodical.remoteMethod('createOneIssue', {
        http: { verb: 'post', path: '/:id/issues' },
        accepts: [
            { arg: 'id', type: 'String' },
            {
                arg: 'data',
                type: 'object',
                http: { source: 'body' }
            }
        ],
        returns: {
            arg: 'data',
            type: 'PeriodicalIssue',
            root: true
        }
    });
    Periodical.createOneIssue = async (id, data) => {
        const periodical = await Periodical.findById(id);

        if (periodical === null) {
            const error = new Error('Not found');
            error.statusCode = 404;
            throw error;
        }

        const PeriodicalIssue = Periodical.app.models.PeriodicalIssue;
        const issue = new PeriodicalIssue(data);
        await periodical.issues$.create(issue);

        return issue;
    };
    Periodical.afterRemote('createOneIssue', async (ctx, issue) => {
        const PeriodicalIssue = ctx.req.app.models.PeriodicalIssue;
        ctx.result = PeriodicalIssue.toPublic(issue);
        ctx.res.statusCode = 201;
    });

    /**
     * PUT /{id}/issues/{child}
     */
    Periodical.remoteMethod('updateOneIssue', {
        http: { verb: 'put', path: '/:id/issues/:issueId' },
        accepts: [
            { arg: 'id', type: 'String' },
            { arg: 'issueId', type: 'String' },
            {
                arg: 'data',
                type: 'object',
                http: { source: 'body' }
            }
        ],
        returns: {
            arg: 'data',
            type: 'Periodical',
            root: true
        }
    });
    Periodical.updateOneIssue = async (id, issueId, data) => {
        const PeriodicalIssue = Periodical.app.models.PeriodicalIssue;
        const issue = await PeriodicalIssue.findById(issueId);

        if (issue === null) {
            const error = new Error('Not found');
            error.statusCode = 404;
            throw error;
        }

        if (issue.periodicalId !== id) {
            const error = new Error('Parent ID mismatch');
            error.statusCode = 400;
            throw error;
        }

        await issue.updateAttributes(data);

        return issue;
    };
};
