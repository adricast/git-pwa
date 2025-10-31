export interface ListResponse<T> {
    total: number;
    skip: number;
    limit: number;
    // 💡 CRÍTICO: 'items' ahora acepta un array de cualquier tipo T.
    items: T[]; 
}