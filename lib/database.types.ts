export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      sedes: {
        Row: {
          id: string;
          nombre: string;
          direccion: string;
          ciudad: string;
          codigo_postal: string | null;
          telefono: string | null;
          activa: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sedes"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["sedes"]["Insert"]>;
      };
      barberos: {
        Row: {
          id: string;
          nombre: string;
          apellidos: string | null;
          foto_url: string | null;
          especialidades: string[] | null;
          sede_id: string | null;
          telefono: string | null;
          email: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["barberos"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["barberos"]["Insert"]>;
      };
      servicios: {
        Row: {
          id: string;
          nombre: string;
          categoria: "corte" | "barba" | "tratamiento" | "estetica" | "pack";
          descripcion: string | null;
          duracion_minutos: number;
          precio: number;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["servicios"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["servicios"]["Insert"]>;
      };
      clientes: {
        Row: {
          id: string;
          auth_user_id: string | null;
          nombre: string;
          apellidos: string | null;
          email: string | null;
          telefono: string | null;
          fecha_nacimiento: string | null;
          notas: string | null;
          sede_preferida: string | null;
          barbero_preferido: string | null;
          total_visitas: number;
          ultima_visita: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clientes"]["Row"], "id" | "created_at" | "total_visitas"> & { id?: string; created_at?: string; total_visitas?: number };
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>;
      };
      horarios_barbero: {
        Row: {
          id: string;
          barbero_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fin: string;
          activo: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["horarios_barbero"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["horarios_barbero"]["Insert"]>;
      };
      bloqueos_agenda: {
        Row: {
          id: string;
          barbero_id: string | null;
          sede_id: string | null;
          fecha_inicio: string;
          fecha_fin: string;
          motivo: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bloqueos_agenda"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["bloqueos_agenda"]["Insert"]>;
      };
      citas: {
        Row: {
          id: string;
          cliente_id: string;
          barbero_id: string;
          servicio_id: string;
          sede_id: string;
          fecha_hora: string;
          duracion_minutos: number;
          estado: "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show";
          notas_cliente: string | null;
          notas_barbero: string | null;
          precio_final: number | null;
          puntos_otorgados: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["citas"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["citas"]["Insert"]>;
      };
      planes_membresia: {
        Row: {
          id: string;
          nombre: string;
          precio_mensual: number;
          descuento_servicios: number;
          puntos_multiplicador: number;
          beneficios: Json | null;
          stripe_price_id: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["planes_membresia"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["planes_membresia"]["Insert"]>;
      };
      membresias: {
        Row: {
          id: string;
          cliente_id: string;
          plan_id: string;
          estado: "activa" | "pausada" | "cancelada" | "expirada";
          fecha_inicio: string;
          fecha_renovacion: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["membresias"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["membresias"]["Insert"]>;
      };
      puntos_fidelizacion: {
        Row: {
          id: string;
          cliente_id: string;
          cita_id: string | null;
          puntos: number;
          concepto: string;
          saldo_acumulado: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["puntos_fidelizacion"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["puntos_fidelizacion"]["Insert"]>;
      };
      cupones: {
        Row: {
          id: string;
          codigo: string;
          tipo: "porcentaje" | "monto_fijo" | "servicio_gratis";
          valor: number | null;
          servicio_id: string | null;
          cliente_id: string | null;
          fecha_expiracion: string | null;
          usado: boolean;
          usado_en_cita_id: string | null;
          motivo: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cupones"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["cupones"]["Insert"]>;
      };
      pagos: {
        Row: {
          id: string;
          cliente_id: string;
          cita_id: string | null;
          membresia_id: string | null;
          monto: number;
          moneda: string;
          stripe_payment_id: string | null;
          stripe_invoice_id: string | null;
          estado: "completado" | "fallido" | "reembolsado" | "pendiente";
          concepto: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pagos"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["pagos"]["Insert"]>;
      };
      mensajes_log: {
        Row: {
          id: string;
          cliente_id: string | null;
          tipo: "whatsapp" | "email";
          workflow: string | null;
          contenido: string | null;
          estado: "enviado" | "fallido" | "pendiente";
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mensajes_log"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["mensajes_log"]["Insert"]>;
      };
    };
    Enums: {
      categoria_servicio: "corte" | "barba" | "tratamiento" | "estetica" | "pack";
      estado_cita: "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show";
      estado_membresia: "activa" | "pausada" | "cancelada" | "expirada";
      tipo_cupon: "porcentaje" | "monto_fijo" | "servicio_gratis";
      estado_pago: "completado" | "fallido" | "reembolsado" | "pendiente";
      tipo_mensaje: "whatsapp" | "email";
      estado_mensaje: "enviado" | "fallido" | "pendiente";
    };
  };
};

// Tipos de conveniencia
export type Sede = Database["public"]["Tables"]["sedes"]["Row"];
export type Barbero = Database["public"]["Tables"]["barberos"]["Row"];
export type Servicio = Database["public"]["Tables"]["servicios"]["Row"];
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type Cita = Database["public"]["Tables"]["citas"]["Row"];
export type PlanMembresia = Database["public"]["Tables"]["planes_membresia"]["Row"];
export type Membresia = Database["public"]["Tables"]["membresias"]["Row"];
export type PuntosFidelizacion = Database["public"]["Tables"]["puntos_fidelizacion"]["Row"];
export type Cupon = Database["public"]["Tables"]["cupones"]["Row"];
export type Pago = Database["public"]["Tables"]["pagos"]["Row"];
export type MensajeLog = Database["public"]["Tables"]["mensajes_log"]["Row"];
