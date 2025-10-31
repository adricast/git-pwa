/** Define una política de seguridad o acceso específica para el usuario. */
export interface PolicyModel {
  // El JSON está vacío, pero se define la estructura para futuras políticas
  policyId?: string;
  policyName?: string;
}