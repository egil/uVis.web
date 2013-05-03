export module uvis {
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
        url?: string;
        query?: string;
    }

    export interface ScreenDefinition {
        id: string;
        name: string;
        url: string;
        forms: FormTemplateDefinition[];
        events?: EventDefinition[];
    }

    export interface FormTemplateDefinition {
        id: string;
        name?: string;
        visible: bool;
        properties?: PropertyDefinition[];
        data?: DataSourceDefinition;
        children: TemplateDefinition[];
        events?: EventDefinition[];
    }

    export interface TemplateDefinition {
        id: string;
        type: string;
        properties?: PropertyDefinition[];
        data?: DataSourceDefinition;
        children?: TemplateDefinition[];
        events?: EventDefinition[];
    }

    export interface PropertyDefinition {
        id: string;
        expression?: string;
        default?: string;
        properties?: PropertyDefinition[];
    }

    export interface EventDefinition {
        name: string;
        expression: string;
    }
}