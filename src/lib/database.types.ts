export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          name: string
          starts_on: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          name: string
          starts_on: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          starts_on?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          address: string | null
          blood_group: string | null
          consent: boolean
          created_at: string
          date_of_birth: string | null
          entry_level: string | null
          full_name: string
          gender: string
          guardian_address: string | null
          guardian_local_government: string | null
          guardian_name: string
          guardian_phone: string
          id: string
          local_government: string | null
          medical_notes: string | null
          notes: string | null
          photo_path: string | null
          previous_islamiyya: string | null
          program: string
          status: string
          student_id: string | null
          student_phone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          consent: boolean
          created_at?: string
          date_of_birth?: string | null
          entry_level?: string | null
          full_name: string
          gender: string
          guardian_address?: string | null
          guardian_local_government?: string | null
          guardian_name: string
          guardian_phone: string
          id?: string
          local_government?: string | null
          medical_notes?: string | null
          notes?: string | null
          photo_path?: string | null
          previous_islamiyya?: string | null
          program: string
          status?: string
          student_id?: string | null
          student_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          consent?: boolean
          created_at?: string
          date_of_birth?: string | null
          entry_level?: string | null
          full_name?: string
          gender?: string
          guardian_address?: string | null
          guardian_local_government?: string | null
          guardian_name?: string
          guardian_phone?: string
          id?: string
          local_government?: string | null
          medical_notes?: string | null
          notes?: string | null
          photo_path?: string | null
          previous_islamiyya?: string | null
          program?: string
          status?: string
          student_id?: string | null
          student_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          att_date: string
          created_at: string
          id: string
          recorded_by: string
          status: string
          student_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          att_date?: string
          created_at?: string
          id?: string
          recorded_by: string
          status: string
          student_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          att_date?: string
          created_at?: string
          id?: string
          recorded_by?: string
          status?: string
          student_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          at: string
          context: Json | null
          id: number
          new: Json | null
          old: Json | null
          row_id: string | null
          summary: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          at?: string
          context?: Json | null
          id?: never
          new?: Json | null
          old?: Json | null
          row_id?: string | null
          summary?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          at?: string
          context?: Json | null
          id?: never
          new?: Json | null
          old?: Json | null
          row_id?: string | null
          summary?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          created_at: string
          finished_on: string | null
          id: string
          sort_order: number
          started_on: string | null
          study_type: string | null
          subject: string
          teacher_id: string | null
          term_number: number
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          finished_on?: string | null
          id?: string
          sort_order?: number
          started_on?: string | null
          study_type?: string | null
          subject: string
          teacher_id?: string | null
          term_number: number
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          finished_on?: string | null
          id?: string
          sort_order?: number
          started_on?: string | null
          study_type?: string | null
          subject?: string
          teacher_id?: string | null
          term_number?: number
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "books_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          class_id: string
          created_at: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          active: boolean
          created_at: string
          hifz_unit: string | null
          id: string
          level: number | null
          name: string
          name_ar: string | null
          program: string
          sort_order: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          hifz_unit?: string | null
          id?: string
          level?: number | null
          name: string
          name_ar?: string | null
          program: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          hifz_unit?: string | null
          id?: string
          level?: number | null
          name?: string
          name_ar?: string | null
          program?: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      correction_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          student_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          student_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          student_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correction_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correction_requests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          file_path: string
          id: string
          title: string
          updated_at: string | null
          updated_by: string | null
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_path: string
          id?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          uploaded_by?: string | null
          visibility: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_path?: string
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          book_id: string
          created_at: string
          entered_by: string
          id: string
          score: number
          student_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          book_id: string
          created_at?: string
          entered_by: string
          id?: string
          score: number
          student_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string
          entered_by?: string
          id?: string
          score?: number
          student_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_path: string
          sort_order: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hifz_entries: {
        Row: {
          absent: boolean
          class_id: string
          created_at: string
          end_ayah: number | null
          end_page: number | null
          end_surah: number | null
          entry_date: string
          grade: string | null
          id: string
          lesson_type: string | null
          lines: number | null
          note: string | null
          pages: number | null
          start_ayah: number | null
          start_page: number | null
          start_surah: number | null
          student_id: string
          teacher_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          absent?: boolean
          class_id: string
          created_at?: string
          end_ayah?: number | null
          end_page?: number | null
          end_surah?: number | null
          entry_date?: string
          grade?: string | null
          id?: string
          lesson_type?: string | null
          lines?: number | null
          note?: string | null
          pages?: number | null
          start_ayah?: number | null
          start_page?: number | null
          start_surah?: number | null
          student_id: string
          teacher_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          absent?: boolean
          class_id?: string
          created_at?: string
          end_ayah?: number | null
          end_page?: number | null
          end_surah?: number | null
          entry_date?: string
          grade?: string | null
          id?: string
          lesson_type?: string | null
          lines?: number | null
          note?: string | null
          pages?: number | null
          start_ayah?: number | null
          start_page?: number | null
          start_surah?: number | null
          student_id?: string
          teacher_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hifz_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_entries_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hijri_offsets: {
        Row: {
          created_at: string
          days: number
          id: string
          starts_on: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          days: number
          id?: string
          starts_on: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          days?: number
          id?: string
          starts_on?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hijri_offsets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          created_at: string
          file_path: string
          id: string
          status: string
          student_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          status?: string
          student_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          status?: string
          student_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          audience: string
          author_id: string | null
          body: string
          cover_path: string | null
          created_at: string
          id: string
          lang: string
          published_at: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          audience: string
          author_id?: string | null
          body?: string
          cover_path?: string | null
          created_at?: string
          id?: string
          lang?: string
          published_at?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          audience?: string
          author_id?: string | null
          body?: string
          cover_path?: string | null
          created_at?: string
          id?: string
          lang?: string
          published_at?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          hidden: boolean
          id: string
          is_owner: boolean
          phone: string | null
          role: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name: string
          hidden?: boolean
          id: string
          is_owner?: boolean
          phone?: string | null
          role: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          hidden?: boolean
          id?: string
          is_owner?: boolean
          phone?: string | null
          role?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_ayahs: {
        Row: {
          ayah: number
          end_line: number
          end_page: number
          juz: number
          line: number
          page: number
          surah: number
        }
        Insert: {
          ayah: number
          end_line: number
          end_page: number
          juz: number
          line: number
          page: number
          surah: number
        }
        Update: {
          ayah?: number
          end_line?: number
          end_page?: number
          juz?: number
          line?: number
          page?: number
          surah?: number
        }
        Relationships: []
      }
      report_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          student_id: string
          teacher_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          student_id: string
          teacher_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          student_id?: string
          teacher_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_months: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          id: string
          month: string
          note: string | null
          profile_id: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          created_at?: string
          id?: string
          month: string
          note?: string | null
          profile_id: string
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          id?: string
          month?: string
          note?: string | null
          profile_id?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_months_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_rates: {
        Row: {
          created_at: string
          monthly_amount: number
          profile_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          monthly_amount: number
          profile_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          monthly_amount?: number
          profile_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_rates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_rates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          id: number
          signature_path: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: number
          signature_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: number
          signature_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          id: string
          note: string | null
          status: string
          student_id: string
          term_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          student_id: string
          term_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          student_id?: string
          term_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_no: string
          admitted_on: string | null
          blood_group: string | null
          class_id: string | null
          created_at: string
          date_of_birth: string | null
          entry_level: string | null
          full_name: string
          full_name_ar: string | null
          gender: string
          guardian_address: string | null
          guardian_local_government: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          local_government: string | null
          medical_notes: string | null
          notes: string | null
          photo_path: string | null
          previous_islamiyya: string | null
          status: string
          student_phone: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_no: string
          admitted_on?: string | null
          blood_group?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          entry_level?: string | null
          full_name: string
          full_name_ar?: string | null
          gender: string
          guardian_address?: string | null
          guardian_local_government?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          local_government?: string | null
          medical_notes?: string | null
          notes?: string | null
          photo_path?: string | null
          previous_islamiyya?: string | null
          status?: string
          student_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_no?: string
          admitted_on?: string | null
          blood_group?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          entry_level?: string | null
          full_name?: string
          full_name_ar?: string | null
          gender?: string
          guardian_address?: string | null
          guardian_local_government?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          local_government?: string | null
          medical_notes?: string | null
          notes?: string | null
          photo_path?: string | null
          previous_islamiyya?: string | null
          status?: string
          student_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string
          ends_on: string
          id: string
          number: number
          starts_on: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          ends_on: string
          id?: string
          number: number
          starts_on: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          ends_on?: string
          id?: string
          number?: number
          starts_on?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hifz_lines_by_student: {
        Args: { p_class: string; p_from: string; p_to: string }
        Returns: {
          period_lines: number
          student_id: string
          total_lines: number
        }[]
      }
      is_member: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      log_action: {
        Args: { p_row: string; p_summary: string; p_table: string }
        Returns: undefined
      }
      my_class_teacher_names: { Args: never; Returns: string[] }
      my_juz_progress: {
        Args: never
        Returns: {
          done_ayahs: number
          juz: number
          total_ayahs: number
        }[]
      }
      my_student_id: { Args: never; Returns: string }
      set_my_phone: { Args: { p_phone: string }; Returns: undefined }
      student_notes: {
        Args: never
        Returns: {
          id: string
          medical_notes: string
          notes: string
        }[]
      }
      teaches_class: { Args: { cid: string }; Returns: boolean }
      teaches_student: { Args: { sid: string }; Returns: boolean }
      term_for_date: { Args: { d: string }; Returns: string }
      term_report_stats: {
        Args: { p_class: string; p_term: string }
        Returns: {
          absent_days: number
          att_absent: number
          att_excused: number
          att_present: number
          jayyid: number
          jayyid_jiddan: number
          mumtaz: number
          present_days: number
          student_id: string
          term_lines: number
          total_lines: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
