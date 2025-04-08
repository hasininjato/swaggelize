const createAssociation = (schemas, models) => {
    const relationTypes = {
        hasOne: 'hasOne',
        hasMany: 'hasMany',
        belongsTo: 'belongsTo',
        belongsToMany: 'belongsToMany'
    };

    const relationMap = new Map();

    models.forEach((model) => {
        Object.values(model.relations || {}).forEach((rel) => {
            if (rel.type !== 'relation') return;

            let source = rel.source;
            let target = rel.target;
            const relType = rel.relation;

            // Normalisation du sens pour belongsTo
            let normalizedSource = source;
            let normalizedTarget = target;

            if (relType === 'belongsTo') {
                normalizedSource = target;
                normalizedTarget = source;
            }

            // Utilise une clé unique, insensible à l'ordre, pour éviter les doublons
            const dedupKey = [normalizedSource, normalizedTarget].sort().join('|');
            const entry = relationMap.get(dedupKey) || {
                source: normalizedSource,
                target: normalizedTarget,
                types: new Set()
            };

            entry.types.add(relType);
            relationMap.set(dedupKey, entry);
        });
    });

    const finalRelations = [];

    for (const { source, target, types } of relationMap.values()) {
        let type = null;

        if (types.has('belongsToMany')) {
            type = 'many-to-many';
        } else if (types.has('hasMany') && types.has('belongsTo')) {
            type = 'one-to-many';
        } else if (types.has('hasOne') && types.has('belongsTo')) {
            type = 'one-to-one';
        } else if (types.has('hasMany')) {
            type = 'one-to-many';
        } else if (types.has('hasOne')) {
            type = 'one-to-one';
        }

        finalRelations.push({ source, target, type });
    }

    return finalRelations;
}

module.exports = { createAssociation };