SELECT
  e.title AS exam_title,
  question->>'id' AS question_id,
  question->>'type' AS question_type,
  question->>'text' AS question_text,
  (question->>'points')::INTEGER AS points
FROM exams e,
  jsonb_array_elements(e.questions) AS question
ORDER BY e.title, question->>'id';

SELECT
  e.title AS exam_title,
  u.name AS student_name,
  answer.key AS question_id,
  answer.value #>> '{}' AS answer_text,
  s.status,
  s.final_grade
FROM submissions s
JOIN exams e ON e.id = s.exam_id
JOIN users u ON u.id = s.student_id,
  jsonb_each(s.answers) AS answer
ORDER BY e.title, u.name, answer.key;
