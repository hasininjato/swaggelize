const createAssociationOneToOne = (model, service) => {
    const { associations } = model;
    console.log(associations)
    if (associations) {
        for (const key in associations) {
            if (associations[key].join === 'OneToOne') {
                const { relation } = associations[key];
                model.belongsTo(service[relation], {
                    foreignKey: key,
                    as: relation
                });
            }
        }
    }
}

module.exports = { createAssociationOneToOne };