import Prepare from 'common/utils/prepareModel';

module.exports = function(Periodical) {
    Prepare(Periodical);

    /**
     * GET /jobs
     * Access: jobs.read
     */
    Periodical.remoteMethod('getAll', {
        http: { verb: 'get', path: '/' },
        accepts: [
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
    Periodical.getAll = async (limit, offset) => {
        const results =  await Promise.all([
            Periodical.find({
                limit,
                order: 'created DESC'
            }),
            Periodical.count()
        ]);

        return {
            jobs: results[0],
            meta: {
                limit,
                offset,
                total: results[1]
            }
        };
    };
    Periodical.afterRemote('getAll', async (ctx) => {
        // if (ctx.result && Array.isArray(ctx.result.jobs)) {
        //     ctx.result.jobs.forEach(Periodical.toPublic);
        // }
    });
};
