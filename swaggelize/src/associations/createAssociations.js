const { classPrivateMethod } = require("@babel/types");

const createAssociation = (schemas, models) => {
    const relationTypes = {
        hasOne: 'hasOne',
        hasMany: 'hasMany',
        belongsTo: 'belongsTo',
        belongsToMany: 'belongsToMany'
    };

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
                        foreignKey: rel.args[0]?.foreignKey || `${target.toLowerCase()}Id`,
                    }
                };

                // Get or create reverse relation
                const reverseEntry = relationMap.get(reverseKey) || {
                    source: target,
                    target: source,
                    types: new Set(),
                    relations: {
                        foreignKey: rel.args[0]?.foreignKey || `${target.toLowerCase()}Id`,
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
                    foreignKey: rel.args[0]?.foreignKey || `${target.toLowerCase()}Id`,
                }
            };

            let relationAlias = null;
            if (rel.args.length > 1 && typeof rel.args[1] === 'object' && rel.args[1].as) {
                rel.args
                relationAlias = rel.args[1].as;
            }

            entry.types.add(relType);
            if (relType === 'hasMany' || relType === 'hasOne') {
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

module.exports = { createAssociation };