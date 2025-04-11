const { classPrivateMethod } = require("@babel/types");

const createAssociationOneToOne = (models, schemas, service) => {
    let associations = [];
    models.forEach((model) => {
        const sequelizeModel = model.sequelizeModel;
        const relations = model.relations;
        relations.forEach((relation) => {
            const relationType = relation.relation;
            const source = relation.source;
            const target = relation.target;
            console.log(source, relationType, target);
            if (relationType === "hasOne" || relationType === "hasMany") {
                associations.push({
                    type: relationType,
                    source: source,
                    target: target
                })
            }
        })
    });
    associations.forEach((association) => {
        console.log(association)
    });
    return service;
}

module.exports = { createAssociationOneToOne };