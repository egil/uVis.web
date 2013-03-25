export module uvis.template {
    export interface AppDefinition {
        id: string;
        name: string;
        description?: string;
        dataSources: DataSourceDefinition[];
        propertySets?: PropertyDefinition[];
        screens: ScreenDefinition[];
    }

    export interface DataSourceDefinition {
        id: string;
        type: string;
        source?: string;
        data?: any;
    }

    export interface ScreenDefinition {
        id: string;
        name: string;
        url: string;
        forms: FormTemplateDefinition[];
    }

    export interface FormTemplateDefinition {
        id: string;
        name?: string;
        visible: bool;
        properties?: PropertyDefinition[];
        dataQuery?: DataQueryDefinition;
        children: TemplateDefinition[];
    }

    export interface TemplateDefinition {
        id: string;
        type: string;
        properties?: PropertyDefinition[];
        dataQuery?: DataQueryDefinition;
        children?: TemplateDefinition[];
    }

    export interface PropertyDefinition {
        id: string;
        expression?: string;
        default?: string;
        properties?: PropertyDefinition[];
    }

    export interface DataQueryDefinition {
        expression: string;
        default?: any;
    }

}