import utdM = module('uvis/template/Definitions');
import uudM = module('uvis/util/Dictionary');
export module uvis.template {

    export class AppDefinitionValidator {
        private static prefixMsg = 'Invalid definition: ';
        private static invalidId = ' is not valid. It must start with a letter, and only contain numbers, letters, and underscores. Provided value was: ';
        private static idRegex = /^[a-zA-Z]\w*$/;
        private static propertyInvalidId = ' is not valid. It must start with a letter, and only contain letters and dashes. Provided value was: ';
        private static propertyIdRegex = /^[a-zA-Z][a-zA-Z-]*$/;
        private static idTracker = new uudM.uvis.util.Dictionary();

        public static validate(def: utdM.uvis.template.AppDefinition) {
            //id: string;
            //name: string;
            //description? : string;
            //dataSources: DataSourceDefinition[];
            //propertySets? : PropertySetDefinition[];
            //screens: ScreenDefinition[];
            if (def === undefined || def === null)
                throw new Error(prefixMsg + 'definition is null or undefined.');

            if (!def.id || !idRegex.test(def.id))
                throw new Error(prefixMsg + 'app.id' + invalidId + def.id);

            ensureGloballyUniqueId(def.id, def);

            if (isUndefinedOrEmpty(def.name))
                throw new Error(prefixMsg + 'app.name is undefined or empty.');

            if (!Array.isArray(def.dataSources) || def.dataSources.length === 0)
                throw new Error(prefixMsg + 'app.dataSources is empty or not an array.');

            if (!Array.isArray(def.screens) || def.screens.length === 0)
                throw new Error(prefixMsg + 'app.screens is empty or not an array.');

            var unkProps = unknownProperties(def, ['id', 'name', 'description', 'dataSources', 'propertySets', 'screens']);
            if (unkProps.hasUnknownProperties)
                throw new Error(prefixMsg + 'app contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);

            validateDataSources(def.dataSources);

            if (Array.isArray(def.propertySets))
                validateProperties(def.propertySets, def.id);

            validateScreens(def.screens);
        }


        private static validateDataSources(dataSourcesDef: utdM.uvis.template.DataSourceDefinition[]) {
            //id: string; // (\D[a-zA-Z]\w*)
            //type: string; // JSON, OData, etc.
            //source? : string; // usually an url to the resource, e.g. OData endpoint or JSON file
            //data? : any;
            var dataSourceTypes = ['JSON'];
            var allowedProperties = ['id', 'type', 'source', 'data'];

            dataSourcesDef.forEach((def) => {
                var unkProps;
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'dataSource.id' + invalidId + def.id);

                ensureGloballyUniqueId(def.id, def);

                if (!def.type || dataSourceTypes.indexOf(def.type) === -1)
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '].type is not valid or undefined. Value is: ' + def.type);

                if (isUndefinedOrEmpty(def.source) && (def.data || typeof def.data === 'object')) {
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '] both source and data is undefined or empty.');
                }

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.hasUnknownProperties)
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);
            });
        }
        
        private static validateScreens(validateScreensDef: utdM.uvis.template.ScreenDefinition[]) {
            //id: string; // (\D[a-zA-Z]\w*)
            //name: string;
            //url: string;
            //forms: FormTemplateDefinition[];
            var allowedProperties = ['id', 'name', 'url', 'forms'];

            validateScreensDef.forEach((def) => {
                var unkProps;
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'screen.id' + invalidId + def.id);

                ensureGloballyUniqueId(def.id, def);

                if (isUndefinedOrEmpty(def.name))
                    throw new Error(prefixMsg + 'screen[' + def.id + '].name is undefined or empty.');

                if (isUndefinedOrEmpty(def.url))
                    throw new Error(prefixMsg + 'screen[' + def.id + '].url is undefined or empty.');

                if (!Array.isArray(def.forms) || def.forms.length === 0)
                    throw new Error(prefixMsg + 'screen[' + def.id + '].forms is undefined or empty.');

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.hasUnknownProperties)
                    throw new Error(prefixMsg + 'screen[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);

                validateForms(def.forms);
            });
        }

        private static validateForms(formsDef: utdM.uvis.template.FormTemplateDefinition[]) {
            //id: string; // (\D[a-zA-Z]\w*)
            //visible: bool; // indicates if a form is visible by default at startup
            //properties? : PropertyDefinition[];
            //dataQuery? : DataQueryDefinition;
            //children: TemplateDefinition[];
            var allowedProperties = ['id', 'name', 'visible', 'properties', 'dataQuery', 'children'];

            formsDef.forEach((def) => {
                var unkProps;
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'form.id' + invalidId + def.id);

                ensureGloballyUniqueId(def.id, def);

                if (def.visible !== undefined && typeof def.visible !== 'boolean')
                    throw new Error(prefixMsg + 'form[' + def.id + '].visible is not valid boolean value.');

                if (!Array.isArray(def.children) || def.children.length === 0)
                    throw new Error(prefixMsg + 'form[' + def.id + '].children is undefined or empty.');

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.hasUnknownProperties)
                    throw new Error(prefixMsg + 'form[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);

                if (def.dataQuery)
                    validateDataQuery(def.dataQuery, 'form', def.id);

                if (Array.isArray(def.properties))
                    validateProperties(def.properties, def.id);

                validateTemplates(def.children);
            });
        }

        private static validateTemplates(templatesDef: utdM.uvis.template.TemplateDefinition[]) {
            //id: string; // (\D[a-zA-Z]\w*)
            //type: string; // a valid Component id
            //properties? : PropertyDefinition[];
            //dataQuery? : DataQueryDefinition;
            //children? : TemplateDefinition[];
            var allowedProperties = ['id', 'type', 'properties', 'dataQuery', 'children'];

            templatesDef.forEach((def) => {
                var unkProps;
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'template.id' + invalidId + def.id);

                ensureGloballyUniqueId(def.id, def);

                if (isUndefinedOrEmpty(def.type))
                    throw new Error(prefixMsg + 'template[' + def.id + '].type is undefined or empty.');

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.hasUnknownProperties)
                    throw new Error(prefixMsg + 'template[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);

                if (def.dataQuery)
                    validateDataQuery(def.dataQuery, 'template', def.id);

                if (Array.isArray(def.properties))
                    validateProperties(def.properties, def.id);

                if (Array.isArray(def.children))
                    validateTemplates(def.children);
            });
        }

        private static validateProperties(def: utdM.uvis.template.PropertyDefinition[], parentId: string) {
            def.forEach((d) => {
                validateProperty(d, parentId);
            });
        }

        private static validateProperty(def: utdM.uvis.template.PropertyDefinition, parentId: string) {
            //name: string;
            //expression ? : string;                
            //default?: string;
            var allowedProperties = ['id', 'expression', 'default', 'properties'];
            var unkProps;

            if (!def.id || !propertyIdRegex.test(def.id))
                throw new Error(prefixMsg + parentId + '.properties.id' + propertyInvalidId + def.id);

            ensureGloballyUniqueId(def.id, def, parentId);

            if (isUndefinedOrEmpty(def.default) && isUndefinedOrEmpty(def.expression) && !Array.isArray(def.properties))
                throw new Error(prefixMsg + parentId + '.properties[' + def.id + '] both default, expression, and properties is undefined or empty.');

            // validate sub properties
            if (Array.isArray(def.properties)) {
                validateProperties(def.properties, parentId + '.' + def.id);
            }

            unkProps = unknownProperties(def, allowedProperties);
            if (unkProps.hasUnknownProperties)
                throw new Error(prefixMsg + parentId + '.properties[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties);
        }

        private static validateDataQuery(def: utdM.uvis.template.DataQueryDefinition, source: string, id: string) {
            //expression: string;
            //default?: any;
            var allowedProperties = ['expression', 'default'];
            var unkProps;

            if (isUndefinedOrEmpty(def.expression))
                throw new Error(prefixMsg + source + '[' + id + '].dataQuery.expression is undefined or empty.');

            unkProps = unknownProperties(def, allowedProperties);
            if (unkProps.hasUnknownProperties)
                throw new Error(prefixMsg + source + '[' + id + '].dataQuery contains unknown properties. Unknown properties are: ' + unkProps.unknownProperties.unknownProperties);
        }

        private static ensureGloballyUniqueId(id, def, parentId?: string) {
            id = parentId ? parentId + '.' + id : id;
            if (idTracker.contains(id))
                throw new Error(prefixMsg + 'id is already in use by another entity. Id\'s must be globally unique. Provided id is: ' + id);
            else
                idTracker.add(id, def);
        }

        private static isUndefinedOrEmpty(str: string) {
            return str === undefined || str.length === 0;
        }

        private static unknownProperties(obj: Object, expectedProperties: string[]): { hasUnknownProperties: bool; unknownProperties: string; } {
            var keys = Object.keys(obj);
            var hasUknProps: bool;
            var result: string = keys.reduce((previousValue, currentValue, index, arr) => {
                if (expectedProperties.indexOf(currentValue) === -1) {
                    // add a , if inbetween values, add a [ at the begining of the list
                    previousValue += previousValue.length > 1 ? ', ' : '';
                    previousValue += currentValue;
                    hasUknProps = true;
                }

                // add an ] to the end of the list
                previousValue += arr.length - 1 === index ? ']' : '';

                return previousValue;
            }, '[');
            return { hasUnknownProperties: hasUknProps, unknownProperties: result };
        }
    }

}