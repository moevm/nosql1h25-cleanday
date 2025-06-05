const substituteIdToEndpoint = (id: string | number, endpoint: string): string => {
    return endpoint.replace('{id}', String(id));
}

export default substituteIdToEndpoint;
