-- ============================================================================
-- TEST DATA — Expanded Academic Progress Scenario (Colombia Context)
-- ============================================================================
-- Extends the test dataset with 5 realistic Colombian student profiles,
-- diverse academic trajectories (repeating grades, transfers, distinct scores,
-- multiple academic years, and different municipalities), and robust group /
-- enrollment coverage to thoroughly test search, filtering, and history endpoints.
--
-- Endpoints exercised:
--   POST /students/get-course-years       (studentId)
--   POST /students/get-academic-history  (studentId)
--   POST /students/get-scores-by-year    (studentId, year)
--   POST /students/get-scores-by-grade   (studentId, gradeName)
--
-- All statements are idempotent (INSERT IGNORE) and rely on natural key resolution.
-- ============================================================================


-- ── 1. Additional Core Subjects (asignatura) ────────────────────────────────

INSERT IGNORE INTO asignatura
  (nombre_asignatura, descripcion_asignatura, intensidad_horaria)
VALUES
  ('Matemáticas',         'Aritmética, álgebra y geometría',     5),
  ('Español',             'Lengua castellana y literatura',      5),
  ('Ciencias Naturales', 'Biología, química y física',          4),
  ('Ciencias Sociales',  'Historia, geografía y democracia',    4),
  ('Inglés',              'Idioma extranjero - inglés',          3),
  ('Educación Física',   'Deporte y salud corporal',            2),
  ('Educación Artística','Artes plásticas y música',            2),
  ('Ética y Valores',    'Formación ética y ciudadana',          1),
  ('Religión',            'Educación religiosa y moral',          1),
  ('Tecnología',          'Informática y tecnología',            2),
  ('Filosofía',           'Pensamiento crítico y filosofía',     3),
  ('Química',             'Química general e inorgánica',        4),
  ('Física',              'Física clásica y mecánica',           4);


-- ── 2. Reference Catalogs & Institution Setup ───────────────────────────────

SET @inst_id = (SELECT id_institucion FROM institucion WHERE nit_institucion = '891900837-2' LIMIT 1);

-- Grades Reference
SET @g_sexto    = (SELECT id_grado FROM grado WHERE nombre_grado = 'Sexto'    LIMIT 1);
SET @g_septimo  = (SELECT id_grado FROM grado WHERE nombre_grado = 'Séptimo'  LIMIT 1);
SET @g_octavo   = (SELECT id_grado FROM grado WHERE nombre_grado = 'Octavo'   LIMIT 1);
SET @g_noveno   = (SELECT id_grado FROM grado WHERE nombre_grado = 'Noveno'   LIMIT 1);
SET @g_decimo   = (SELECT id_grado FROM grado WHERE nombre_grado = 'Décimo'   LIMIT 1);
SET @g_once     = (SELECT id_grado FROM grado WHERE nombre_grado = 'Once'     LIMIT 1);

-- Document Types & Genders
SET @dt_ti   = (SELECT id_tipo_documento FROM tipo_documento WHERE nombre_tipodocumento = 'Tarjeta de Identidad' LIMIT 1);
SET @dt_cc   = (SELECT id_tipo_documento FROM tipo_documento WHERE nombre_tipodocumento = 'Cédula de Ciudadanía' LIMIT 1);
SET @gen_masc = (SELECT id_genero FROM genero WHERE nombre_genero = 'Masculino' LIMIT 1);
SET @gen_fem  = (SELECT id_genero FROM genero WHERE nombre_genero = 'Femenino'  LIMIT 1);

-- Municipalities (Valle del Cauca)
SET @muni_roldanillo = (
  SELECT m.id_municipio FROM municipio m
  JOIN departamento d ON m.id_departamento = d.id_departamento
  WHERE m.nombre_municipio = 'Roldanillo' AND d.nombre_departamento = 'Valle del Cauca' LIMIT 1
);
SET @muni_cali = (
  SELECT m.id_municipio FROM municipio m
  JOIN departamento d ON m.id_departamento = d.id_departamento
  WHERE m.nombre_municipio = 'Cali' AND d.nombre_departamento = 'Valle del Cauca' LIMIT 1
);
SET @muni_palmira = (
  SELECT m.id_municipio FROM municipio m
  JOIN departamento d ON m.id_departamento = d.id_departamento
  WHERE m.nombre_municipio = 'Palmira' AND d.nombre_departamento = 'Valle del Cauca' LIMIT 1
);
SET @muni_tagua = (
  SELECT m.id_municipio FROM municipio m
  JOIN departamento d ON m.id_departamento = d.id_departamento
  WHERE m.nombre_municipio = 'Tulua' OR m.nombre_municipio = 'Tuluá' AND d.nombre_departamento = 'Valle del Cauca' LIMIT 1
);


-- ── 3. Groups (grupo) ───────────────────────────────────────────────────────
-- Expanded academic cohorts across 2020 - 2024 to support deep filtering tests.

INSERT IGNORE INTO grupo
  (nombre_grupo, anio_grupo, id_grado_grupo, jornada, id_institucion, estado_grupo)
VALUES
  -- Baseline groups
  ('6-A', 2020, @g_sexto,   'DIURNA',   @inst_id, 'ACTIVO'),
  ('7-A', 2021, @g_septimo, 'DIURNA',   @inst_id, 'ACTIVO'),
  ('7-B', 2022, @g_septimo, 'DIURNA',   @inst_id, 'ACTIVO'),
  ('8-A', 2023, @g_octavo,  'DIURNA',   @inst_id, 'ACTIVO'),
  -- Additional cohorts
  ('8-B', 2021, @g_octavo,  'DIURNA',   @inst_id, 'ACTIVO'),
  ('9-A', 2022, @g_noveno,  'DIURNA',   @inst_id, 'ACTIVO'),
  ('9-B', 2023, @g_noveno,  'DIURNA',   @inst_id, 'ACTIVO'),
  ('10-A', 2023, @g_decimo, 'DIURNA',   @inst_id, 'ACTIVO'),
  ('10-B', 2024, @g_decimo, 'NOCTURNA', @inst_id, 'ACTIVO'),
  ('11-A', 2024, @g_once,   'DIURNA',   @inst_id, 'ACTIVO');

-- Group References
SET @grp_6a_2020  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '6-A'  AND anio_grupo = 2020 LIMIT 1);
SET @grp_7a_2021  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '7-A'  AND anio_grupo = 2021 LIMIT 1);
SET @grp_7b_2022  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '7-B'  AND anio_grupo = 2022 LIMIT 1);
SET @grp_8a_2023  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '8-A'  AND anio_grupo = 2023 LIMIT 1);
SET @grp_8b_2021  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '8-B'  AND anio_grupo = 2021 LIMIT 1);
SET @grp_9a_2022  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '9-A'  AND anio_grupo = 2022 LIMIT 1);
SET @grp_9b_2023  = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '9-B'  AND anio_grupo = 2023 LIMIT 1);
SET @grp_10a_2023 = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '10-A' AND anio_grupo = 2023 LIMIT 1);
SET @grp_10b_2024 = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '10-B' AND anio_grupo = 2024 LIMIT 1);
SET @grp_11a_2024 = (SELECT id_grupo FROM grupo WHERE nombre_grupo = '11-A' AND anio_grupo = 2024 LIMIT 1);


-- ── 4. Students (estudiante) ────────────────────────────────────────────────
-- All names are single-word strings without spaces to comply with regex validation: [\p{L}]{3,50}

INSERT IGNORE INTO estudiante
  (primer_nombre_estudiante, segundo_nombre_estudiante,
   primer_apellido_estudiante, segundo_apellido_estudiante,
   identificacion_estudiante, fecha_nacimiento_estudiante,
   id_municipio_estudiante, id_tipo_documento_estudiante, id_genero_estudiante,
   direccion_estudiante, email_estudiante)
VALUES
  -- 1. Juan Camilo Pérez Rodríguez (Baseline repeat scenario)
  ('Juan', 'Camilo', 'Pérez', 'Rodríguez',
   '1085123456', '2008-03-15',
   @muni_roldanillo, @dt_ti, @gen_masc,
   'Calle 5 # 4-32 Barrio Centro', 'juan.perez.test@test.local'),

  -- 2. Valentina María Restrepo Gómez (High-performing student, 2021-2024 progression)
  ('Valentina', 'María', 'Restrepo', 'Gómez',
   '1085987654', '2007-08-22',
   @muni_cali, @dt_ti, @gen_fem,
   'Carrera 15 # 8-45 Barrio Granada', 'valentina.restrepo.test@test.local'),

  -- 3. Santiago Andrés Caicedo Mosquera (Transferred student, late enrollment)
  ('Santiago', 'Andrés', 'Caicedo', 'Mosquera',
   '1085456789', '2006-11-05',
   @muni_palmira, @dt_cc, @gen_masc,
   'Calle 12 # 22-10 Barrio Las Mercedes', 'santiago.caicedo.test@test.local'),

  -- 4. Mariana Lucía Osorio Bermúdez (Repeated 9th grade scenario)
  ('Mariana', 'Lucía', 'Osorio', 'Bermúdez',
   '1085112233', '2007-01-30',
   @muni_roldanillo, @dt_ti, @gen_fem,
   'Carrera 4 # 10-18 Barrio El Carmen', 'mariana.osorio.test@test.local'),

  -- 5. Mateo Esteban Morales Agudelo (Night shift student)
  ('Mateo', 'Esteban', 'Morales', 'Agudelo',
   '1085667788', '2005-05-19',
   @muni_roldanillo, @dt_cc, @gen_masc,
   'Calle 8 # 3-50 Barrio San Antonio', 'mateo.morales.test@test.local');

-- Student ID References
SET @st_juan      = (SELECT id_estudiante FROM estudiante WHERE identificacion_estudiante = '1085123456' LIMIT 1);
SET @st_valentina = (SELECT id_estudiante FROM estudiante WHERE identificacion_estudiante = '1085987654' LIMIT 1);
SET @st_santiago  = (SELECT id_estudiante FROM estudiante WHERE identificacion_estudiante = '1085456789' LIMIT 1);
SET @st_mariana   = (SELECT id_estudiante FROM estudiante WHERE identificacion_estudiante = '1085112233' LIMIT 1);
SET @st_mateo     = (SELECT id_estudiante FROM estudiante WHERE identificacion_estudiante = '1085667788' LIMIT 1);


-- ── 5. Enrollments (matricula) ──────────────────────────────────────────────

INSERT IGNORE INTO matricula
  (id_estudiante_matricula, id_grupo_matricula, fecha_matricula)
VALUES
  -- Juan Camilo
  (@st_juan, @grp_6a_2020, '2020-02-03'),
  (@st_juan, @grp_7a_2021, '2021-02-01'),
  (@st_juan, @grp_7b_2022, '2022-02-07'),
  (@st_juan, @grp_8a_2023, '2023-02-06'),

  -- Valentina (8th to 11th grade)
  (@st_valentina, @grp_8b_2021,  '2021-02-01'),
  (@st_valentina, @grp_9a_2022,  '2022-02-01'),
  (@st_valentina, @grp_10a_2023, '2023-02-01'),
  (@st_valentina, @grp_11a_2024, '2024-02-05'),

  -- Santiago (9th to 10th grade)
  (@st_santiago, @grp_9b_2023,  '2023-02-10'),
  (@st_santiago, @grp_10b_2024, '2024-02-12'),

  -- Mariana (Repeated Noveno in 2022 & 2023)
  (@st_mariana, @grp_9a_2022,  '2022-02-05'),
  (@st_mariana, @grp_9b_2023,  '2023-02-08'),
  (@st_mariana, @grp_10a_2024, '2024-02-06'),

  -- Mateo (10th grade Night shift)
  (@st_mateo, @grp_10b_2024, '2024-02-15');

-- Enrollment References
SET @enr_juan_2020 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_juan AND id_grupo_matricula = @grp_6a_2020 LIMIT 1);
SET @enr_juan_2021 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_juan AND id_grupo_matricula = @grp_7a_2021 LIMIT 1);
SET @enr_juan_2022 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_juan AND id_grupo_matricula = @grp_7b_2022 LIMIT 1);
SET @enr_juan_2023 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_juan AND id_grupo_matricula = @grp_8a_2023 LIMIT 1);

SET @enr_val_2021  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_valentina AND id_grupo_matricula = @grp_8b_2021 LIMIT 1);
SET @enr_val_2022  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_valentina AND id_grupo_matricula = @grp_9a_2022 LIMIT 1);
SET @enr_val_2023  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_valentina AND id_grupo_matricula = @grp_10a_2023 LIMIT 1);
SET @enr_val_2024  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_valentina AND id_grupo_matricula = @grp_11a_2024 LIMIT 1);

SET @enr_sant_2023 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_santiago AND id_grupo_matricula = @grp_9b_2023 LIMIT 1);
SET @enr_sant_2024 = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_santiago AND id_grupo_matricula = @grp_10b_2024 LIMIT 1);

SET @enr_mar_2022  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_mariana AND id_grupo_matricula = @grp_9a_2022 LIMIT 1);
SET @enr_mar_2023  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_mariana AND id_grupo_matricula = @grp_9b_2023 LIMIT 1);

SET @enr_mat_2024  = (SELECT id_matricula FROM matricula WHERE id_estudiante_matricula = @st_mateo AND id_grupo_matricula = @grp_10b_2024 LIMIT 1);


-- ── 6. Subject References ───────────────────────────────────────────────────

SET @sub_mat = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Matemáticas'         LIMIT 1);
SET @sub_esp = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Español'             LIMIT 1);
SET @sub_nat = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Ciencias Naturales' LIMIT 1);
SET @sub_soc = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Ciencias Sociales'  LIMIT 1);
SET @sub_ing = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Inglés'             LIMIT 1);
SET @sub_qui = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Química'            LIMIT 1);
SET @sub_fis = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Física'             LIMIT 1);
SET @sub_fil = (SELECT id_asignatura FROM asignatura WHERE nombre_asignatura = 'Filosofía'          LIMIT 1);


-- ── 7. Scores (calificacion) ────────────────────────────────────────────────

INSERT IGNORE INTO calificacion
  (nota_original_calificacion, tipo_nota_calificacion, id_asignatura_calificacion, nota_habilitacion, id_matricula_calificacion)
VALUES
  -- --------------------------------------------------------------------------
  -- Juan Camilo Pérez
  -- --------------------------------------------------------------------------
  ('3.5', 'NUMERICA', @sub_mat, '3.5', @enr_juan_2020),
  ('4.0', 'NUMERICA', @sub_esp, '4.0', @enr_juan_2020),
  ('3.8', 'NUMERICA', @sub_nat, '3.8', @enr_juan_2020),
  ('4.2', 'NUMERICA', @sub_soc, '4.2', @enr_juan_2020),
  ('3.2', 'NUMERICA', @sub_ing, '3.2', @enr_juan_2020),

  ('4.1', 'NUMERICA', @sub_mat, '4.1', @enr_juan_2021),
  ('4.3', 'NUMERICA', @sub_esp, '4.3', @enr_juan_2021),
  ('4.0', 'NUMERICA', @sub_nat, '4.0', @enr_juan_2021),
  ('4.5', 'NUMERICA', @sub_soc, '4.5', @enr_juan_2021),
  ('3.8', 'NUMERICA', @sub_ing, '3.8', @enr_juan_2021),

  ('4.4', 'NUMERICA', @sub_mat, '4.4', @enr_juan_2022),
  ('4.5', 'NUMERICA', @sub_esp, '4.5', @enr_juan_2022),
  ('4.2', 'NUMERICA', @sub_nat, '4.2', @enr_juan_2022),
  ('4.7', 'NUMERICA', @sub_soc, '4.7', @enr_juan_2022),
  ('4.0', 'NUMERICA', @sub_ing, '4.0', @enr_juan_2022),

  ('4.6', 'NUMERICA', @sub_mat, '4.6', @enr_juan_2023),
  ('4.8', 'NUMERICA', @sub_esp, '4.8', @enr_juan_2023),
  ('4.5', 'NUMERICA', @sub_nat, '4.5', @enr_juan_2023),
  ('4.9', 'NUMERICA', @sub_soc, '4.9', @enr_juan_2023),
  ('4.3', 'NUMERICA', @sub_ing, '4.3', @enr_juan_2023),

  -- --------------------------------------------------------------------------
  -- Valentina Restrepo (High academic performance)
  -- --------------------------------------------------------------------------
  ('4.8', 'NUMERICA', @sub_mat, '4.8', @enr_val_2021),
  ('4.9', 'NUMERICA', @sub_esp, '4.9', @enr_val_2021),
  ('4.7', 'NUMERICA', @sub_nat, '4.7', @enr_val_2021),

  ('4.9', 'NUMERICA', @sub_mat, '4.9', @enr_val_2022),
  ('5.0', 'NUMERICA', @sub_esp, '5.0', @enr_val_2022),
  ('4.8', 'NUMERICA', @sub_ing, '4.8', @enr_val_2022),

  ('4.7', 'NUMERICA', @sub_mat, '4.7', @enr_val_2023),
  ('4.6', 'NUMERICA', @sub_qui, '4.6', @enr_val_2023),
  ('4.8', 'NUMERICA', @sub_fis, '4.8', @enr_val_2023),

  ('5.0', 'NUMERICA', @sub_mat, '5.0', @enr_val_2024),
  ('4.9', 'NUMERICA', @sub_fil, '4.9', @enr_val_2024),
  ('5.0', 'NUMERICA', @sub_ing, '5.0', @enr_val_2024),

  -- --------------------------------------------------------------------------
  -- Santiago Caicedo (Remedial exam / 'habilitación' case)
  -- --------------------------------------------------------------------------
  ('2.5', 'NUMERICA', @sub_mat, '3.5', @enr_sant_2023), -- failed original, passed remedial
  ('3.8', 'NUMERICA', @sub_esp, '3.8', @enr_sant_2023),

  ('3.2', 'NUMERICA', @sub_mat, '3.2', @enr_sant_2024),
  ('2.8', 'NUMERICA', @sub_qui, '3.0', @enr_sant_2024), -- remedial pass

  -- --------------------------------------------------------------------------
  -- Mariana Osorio (Repeat grade Noveno with improvement)
  -- --------------------------------------------------------------------------
  ('2.0', 'NUMERICA', @sub_mat, '2.8', @enr_mar_2022), -- failed year
  ('3.0', 'NUMERICA', @sub_esp, '3.0', @enr_mar_2022),

  ('3.8', 'NUMERICA', @sub_mat, '3.8', @enr_mar_2023), -- repeated year passed
  ('4.1', 'NUMERICA', @sub_esp, '4.1', @enr_mar_2023),

  -- --------------------------------------------------------------------------
  -- Mateo Morales (Night shift student)
  -- --------------------------------------------------------------------------
  ('3.5', 'NUMERICA', @sub_mat, '3.5', @enr_mat_2024),
  ('3.7', 'NUMERICA', @sub_esp, '3.7', @enr_mat_2024),
  ('4.0', 'NUMERICA', @sub_fil, '4.0', @enr_mat_2024);


-- ── 8. Summary Query ────────────────────────────────────────────────────────

SELECT e.id_estudiante,
       CONCAT(e.primer_nombre_estudiante, ' ', e.primer_apellido_estudiante) AS estudiante,
       g.nombre_grupo,
       g.anio_grupo,
       gr.nombre_grado,
       m.id_matricula
FROM estudiante e
JOIN matricula m ON e.id_estudiante = m.id_estudiante_matricula
JOIN grupo g ON m.id_grupo_matricula = g.id_grupo
JOIN grado gr ON g.id_grado_grupo = gr.id_grado
ORDER BY e.id_estudiante, g.anio_grupo;
