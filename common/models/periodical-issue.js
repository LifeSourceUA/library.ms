import Prepare from 'common/utils/prepareModel';

module.exports = function(PeriodicalIssue) {
    Prepare(PeriodicalIssue);

    PeriodicalIssue.toPublic = (issue) => {
        return issue;
    };
};
