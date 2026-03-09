export interface Tramite_user {
  user_id: number;
  tramite_id: string;
  estado_tramite: 'pendiente' | 'en_proceso' | 'completado';
 fecha_inicio:Date;
 fecha_finalizacion?:Date;
 progreso: number;
}