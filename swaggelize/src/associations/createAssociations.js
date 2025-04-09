const createAssociation = (models) => {
    const relationMap = new Map();

    models.forEach((model) => {
        (model.relations || []).forEach((rel) => {
            if (rel.type !== 'relation') return;

            const source = rel.source;
            const target = rel.target;
            const relType = rel.relation;

            // For belongsToMany, we want to track both directions separately
            if (relType === 'belongsToMany') {
                const forwardKey = `${source}|${target}|belongsToMany`;
                const reverseKey = `${target}|${source}|belongsToMany`;

                // Get or create forward relation
                const forwardEntry = relationMap.get(forwardKey) || {
                    source,
                    target,
                    types: new Set(),
                    relations: {
                        associationField: null,
                        foreignKey: null
                    }
                };

                // Get or create reverse relation
                const reverseEntry = relationMap.get(reverseKey) || {
                    source: target,
                    target: source,
                    types: new Set(),
                    relations: {
                        foreignKey: null
                    }
                };

                // Extract through table and aliases
                const sourceAlias = rel.args[1]?.as;

                // Update entries
                forwardEntry.types.add('belongsToMany');
                forwardEntry.relations.associationField = sourceAlias || `${target.toLowerCase()}s`;

                relationMap.set(forwardKey, forwardEntry);
                relationMap.set(reverseKey, reverseEntry);
                return;
            }

            // Handle other relation types (existing logic)
            let normalizedSource = source;
            let normalizedTarget = target;

            if (relType === 'belongsTo') {
                normalizedSource = target;
                normalizedTarget = source;
            }

            const dedupKey = [normalizedSource, normalizedTarget].sort().join('|');
            const entry = relationMap.get(dedupKey) || {
                source: normalizedSource,
                target: normalizedTarget,
                types: new Set(),
                relations: {
                    associationField: null,
                    foreignKey: rel.args[1]?.foreignKey?.name || rel.args[1]?.foreignKey || `${source.toLowerCase()}Id`,
                }
            };

            let relationAlias = null;
            if (rel.args.length > 1 && typeof rel.args[1] === 'object' && rel.args[1].as) {
                rel.args
                relationAlias = rel.args[1].as;
            }

            entry.types.add(relType);
            if (relType === 'hasMany') {
                entry.relations.associationField = relationAlias || `${target.toLowerCase()}s`;
            }

            relationMap.set(dedupKey, entry);
        });
    });

    const finalRelations = [];

    for (const { source, target, types, relations } of relationMap.values()) {
        let type = null;

        if (types.has('belongsToMany')) {
            type = 'many-to-many';
        } else if (types.has('hasMany') || (types.has('hasOne') && types.has('belongsTo'))) {
            type = 'one-to-many';
        } else if (types.has('hasOne')) {
            type = 'one-to-one';
        } else if (types.has('belongsTo')) {
            type = 'one-to-one'; // Or whatever you want for single belongsTo
        }

        finalRelations.push({
            source,
            target,
            type,
            relations
        });
    }

    return finalRelations;
};

const parseAssociation = (schemas, models) => {
    const associations = createAssociation(models);
    let componentSchema = {};
    associations.forEach((association) => {
        const { source, target, type, relations } = association;
        if (type == "one-to-one") {
            // component schema item
            schemas.schemas[`${source}${target}Item`] = createBody("Item", source, target, schemas, `${target.toLowerCase()}Id`);
            schemas.schemas[`${target}${source}Item`] = createBody("Item", target, source, schemas, relations.foreignKey);

            // component schema post
            schemas.schemas[`${source}${target}Post`] = createBody("Post", source, target, schemas, `${target.toLowerCase()}Id`);
            schemas.schemas[`${target}${source}Post`] = createBody("Post", target, source, schemas, relations.foreignKey);

            // component schema put
            schemas.schemas[`${source}${target}Put`] = createBody("Put", source, target, schemas, `${target.toLowerCase()}Id`);
            schemas.schemas[`${target}${source}Put`] = createBody("Put", target, source, schemas, relations.foreignKey);

            // component schema list
            schemas.schemas[`${source}${target}List`] = createBody("List", source, target, schemas, `${target.toLowerCase()}Id`);
            schemas.schemas[`${target}${source}List`] = createBody("List", target, source, schemas, relations.foreignKey);

        }
    })
    // console.log("componentSchema", JSON.stringify(schemas, null, 4));
}

function createBody(method, source, target, schemas, relation) {
    if (method == "List") {
        return {
            type: "array",
            items: {
                type: "object",
                properties: {
                    ...schemas.schemas[`${source}${target}Item`].properties
                }
            }
        };
    }
    return {
        type: "object",
        properties: {
            ...schemas.schemas[`${source}${method}`].properties,
            [relation]: {
                type: "object",
                properties: schemas.schemas[`${target}${method}`].properties
            }
        }
    };
}

module.exports = { parseAssociation };