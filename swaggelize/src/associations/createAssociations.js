const createAssociation = (models) => {
    const relationMap = new Map();

    const createRelationEntry = (source, target, relArgs = {}, isReverse = false) => ({
        source,
        target,
        types: new Set(),
        relations: {
            associationField: isReverse ? null : relArgs.as || `${target.toLowerCase()}s`,
            foreignKey: relArgs.foreignKey?.name || relArgs.foreignKey || `${source.toLowerCase()}Id`
        }
    });

    const processRelation = (rel) => {
        if (rel.type !== 'relation') return;

        const { source, target, relation: relType, args = [] } = rel;
        const relArgs = args[1] || {};

        if (relType === 'belongsToMany') {
            const forwardKey = `${source}|${target}|belongsToMany`;
            const reverseKey = `${target}|${source}|belongsToMany`;

            const forwardEntry = relationMap.get(forwardKey) || createRelationEntry(source, target, relArgs);
            const reverseEntry = relationMap.get(reverseKey) || createRelationEntry(target, source, relArgs, true);

            forwardEntry.types.add('belongsToMany');
            relationMap.set(forwardKey, forwardEntry);
            relationMap.set(reverseKey, reverseEntry);
            return;
        }

        const isBelongsTo = relType === 'belongsTo';
        const normalizedSource = isBelongsTo ? target : source;
        const normalizedTarget = isBelongsTo ? source : target;

        const dedupKey = [normalizedSource, normalizedTarget].sort().join('|');
        const entry = relationMap.get(dedupKey) || createRelationEntry(normalizedSource, normalizedTarget, relArgs);

        entry.types.add(relType);
        if (relType === 'hasMany') {
            entry.relations.associationField = relArgs.as || `${target.toLowerCase()}s`;
        }

        relationMap.set(dedupKey, entry);
    };

    models.forEach(model => (model.relations || []).forEach(processRelation));

    return Array.from(relationMap.values()).map(({ source, target, types, relations }) => {
        let type;
        if (types.has('belongsToMany')) {
            type = 'many-to-many';
        } else if (types.has('hasMany') || (types.has('hasOne') && types.has('belongsTo'))) {
            type = 'one-to-many';
        } else {
            type = 'one-to-one';
        }

        return { source, target, type, relations };
    });
};

const parseAssociation = (schemas, models) => {
    const associations = createAssociation(models);

    const createSchemas = (source, target, relation, type) => {
        const methods = ['Item', 'Post', 'Put', 'List'];
        const lowerTarget = target.toLowerCase();

        if (type === "one-to-one") {
            methods.forEach(method => {
                schemas.schemas[`${source}${target}${method}`] = createBody(method, source, target, schemas, `${lowerTarget}Id`);
                schemas.schemas[`${target}${source}${method}`] = createBody(method, target, source, schemas, relation.foreignKey);
            });
        } else if (type === "one-to-many") {
            schemas.schemas[`${source}${target}sItem`] = createBody("Item", source, target, schemas, relation.associationField, "one-to-many");
            schemas.schemas[`${target}s${source}Item`] = createBody("Item", target, source, schemas, relation.foreignKey);

            schemas.schemas[`${source}${target}sList`] = createBody("List", source, target, schemas, relation.associationField, "one-to-many");
            schemas.schemas[`${target}s${source}List`] = createBody("List", target, source, schemas, relation.foreignKey, "one-to-many", "target");

            schemas.schemas[`${source}${target}sPost`] = createBody("Post", source, target, schemas, relation.associationField, "one-to-many");
            schemas.schemas[`${target}s${source}Post`] = createBody("Post", target, source, schemas, relation.foreignKey, "one-to-many", "target");

            schemas.schemas[`${source}${target}sPut`] = createBody("Put", source, target, schemas, relation.associationField, "one-to-many");
            schemas.schemas[`${target}s${source}Put`] = createBody("Put", target, source, schemas, relation.foreignKey, "one-to-many", "target");
        }
    };

    associations.forEach(({ source, target, type, relations }) => {
        createSchemas(source, target, relations, type);
    });
};

const createBody = (method, source, target, schemas, relation, type = null, from = null) => {
    const getTargetSchema = () => schemas.schemas[`${target}List`]?.items?.properties || {};
    const getSourceItemSchema = () => schemas.schemas[`${source}Item`]?.properties || {};

    if (type === "one-to-many") {
        const relationSchema = from === "target"
            ? { type: "object", properties: getSourceItemSchema() }
            : {
                type: "array",
                items: {
                    type: "object",
                    properties: getTargetSchema()
                }
            };

        const baseProperties = { ...getTargetSchema(), [relation]: relationSchema };

        return method === "List"
            ? { type: "array", items: { type: "object", properties: baseProperties } }
            : { type: "object", properties: baseProperties };
    }

    if (method === "List") {
        return {
            type: "array",
            items: {
                type: "object",
                properties: schemas.schemas[`${source}${target}Item`]?.properties || {}
            }
        };
    }

    return {
        type: "object",
        properties: {
            ...(schemas.schemas[`${source}${method}`]?.properties || {}),
            [relation]: {
                type: "object",
                properties: schemas.schemas[`${target}${method}`]?.properties || {}
            }
        }
    };
};

module.exports = { parseAssociation };