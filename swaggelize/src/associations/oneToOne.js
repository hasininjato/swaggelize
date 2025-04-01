const createAssociationOneToOne = (models, service) => {
    models.forEach(model => {
        // one to one relationship: hasOne and belongsTo associations are used together
        const relations = model.relations;
        let relationType = "";
        Object.entries(relations).forEach(([key, relation]) => {
            
        });
    });
    console.log(service)
}

module.exports = { createAssociationOneToOne };