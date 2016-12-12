import Prepare from 'common/utils/prepareModel';

module.exports = function(Magazine) {
    Prepare(Magazine);

    Magazine.toPublic = (magazine) => {
        return magazine;
    };

    /**
     * POST /
     */
    Magazine.remoteMethod('createOne', {
        http: { verb: 'post', path: '/' },
        accepts: {
            arg: 'data',
            type: 'object',
            http: { source: 'body' }
        },
        returns: {
            arg: 'data',
            type: 'Magazine',
            root: true
        }
    });
    Magazine.createOne = async (data) => {
        const magazine = new Magazine(data);

        await Magazine.create(magazine);

        return magazine;
    };
    Magazine.afterRemote('createOne', async (ctx, job) => {
        ctx.result = Magazine.toPublic(job);
        ctx.res.statusCode = 201;
    });
    
    /**
     * GET /
     */
    Magazine.remoteMethod('getAll', {
        http: { verb: 'get', path: '/' },
        accepts: [
            { arg: 'limit', type: 'number' },
            { arg: 'offset', type: 'number' }
        ],
        returns: { type: 'Object', root: true }
    });
    Magazine.beforeRemote('getAll', async (ctx) => {
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
    Magazine.getAll = async (limit, offset) => {
        const results =  await Promise.all([
            Magazine.find({
                limit
            }),
            Magazine.count()
        ]);

        return {
            magazines: results[0],
            meta: {
                limit,
                offset,
                total: results[1]
            }
        };
    };
    Magazine.afterRemote('getAll', async (ctx) => {
        if (ctx.result && Array.isArray(ctx.result.magazines)) {
            ctx.result.magazines.forEach(Magazine.toPublic);
        }

        if (ctx.result.meta.total === 0) {
            ctx.res.statusCode = 404;
        }
    });

    /**
     * PUT /{id}
     */
    Magazine.remoteMethod('updateOne', {
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
            type: 'Magazine',
            root: true
        }
    });
    Magazine.updateOne = async (id, data) => {
        const magazine = await Magazine.findById(id);

        if (magazine === null) {
            const error = new Error('Not found');
            error.statusCode = 404;
            throw error;
        }

        await magazine.updateAttributes(data);
        // await magazine.save();

        return magazine;
    };
};
