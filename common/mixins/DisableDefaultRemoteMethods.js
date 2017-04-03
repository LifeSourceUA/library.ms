/**
 * Disable all default methods on Loopback model
 *
 * @param Model
 */
const DisableDefaultRemoteMethods = (Model) => {
    Model.disableRemoteMethodByName('create');
    Model.disableRemoteMethodByName('upsert');
    Model.disableRemoteMethodByName('updateAll');
    Model.disableRemoteMethodByName('updateAttributes');
    Model.disableRemoteMethodByName('createChangeStream');

    Model.disableRemoteMethodByName('find');
    Model.disableRemoteMethodByName('findById');
    Model.disableRemoteMethodByName('findOne');
    Model.disableRemoteMethodByName('count');
    Model.disableRemoteMethodByName('exists');
    Model.disableRemoteMethodByName('deleteById');

    // Relations
    try {
        if (!Model.definition.settings.relations) {
            return;
        }

        Object.keys(Model.definition.settings.relations).forEach((relation) => {
            Model.disableRemoteMethodByName(`prototype.__findById__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__destroyById__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__updateById__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__exists__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__link__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__get__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__create__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__update__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__destroy__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__unlink__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__count__${relation}`);
            Model.disableRemoteMethodByName(`prototype.__delete__${relation}`);
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = DisableDefaultRemoteMethods;
