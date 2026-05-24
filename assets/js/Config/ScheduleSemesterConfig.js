(function () {
  'use strict';

  /*
    Semester configuration for Schedule export.

    Notes:
    - The user's First Semester corresponds to Fall.
    - The user's Second Semester corresponds to Spring.
    - Summer semesters are intentionally omitted because they have not been used.
    - week1Monday is the Monday of teaching week 1.
    - freshmanClassStartDate is kept only where freshman teaching starts later than normal teaching week 1.
  */

  window.SCHEDULE_SEMESTER_CONFIG = {
    defaultSemesterId: 'junior-second',

    semesters: {
      'freshman-first': {
        id: 'freshman-first',
        labelEN: 'Freshman Year - First Semester',
        labelZH: '大一上（23秋）',
        termEN: '2023 Fall',
        termZH: '2023 年秋季学期',
        week1Monday: '2023-09-04',
        freshmanClassStartDate: '2023-09-11',
        termEndDate: '2024-01-19',
        teachingWeeks: 20,
        timezone: 'Asia/Shanghai'
      },

      'freshman-second': {
        id: 'freshman-second',
        labelEN: 'Freshman Year - Second Semester',
        labelZH: '大一下（24春）',
        termEN: '2024 Spring',
        termZH: '2024 年春季学期',
        week1Monday: '2024-02-26',
        termEndDate: '2024-06-28',
        teachingWeeks: 18,
        timezone: 'Asia/Shanghai'
      },

      'sophomore-first': {
        id: 'sophomore-first',
        labelEN: 'Sophomore Year - First Semester',
        labelZH: '大二上（24秋）',
        termEN: '2024 Fall',
        termZH: '2024 年秋季学期',
        week1Monday: '2024-09-02',
        termEndDate: '2025-01-17',
        teachingWeeks: 20,
        timezone: 'Asia/Shanghai'
      },

      'sophomore-second': {
        id: 'sophomore-second',
        labelEN: 'Sophomore Year - Second Semester',
        labelZH: '大二下（25春）',
        termEN: '2025 Spring',
        termZH: '2025 年春季学期',
        week1Monday: '2025-02-24',
        termEndDate: '2025-06-27',
        teachingWeeks: 18,
        timezone: 'Asia/Shanghai'
      },

      'junior-first': {
        id: 'junior-first',
        labelEN: 'Junior Year - First Semester',
        labelZH: '大三上（25秋）',
        termEN: '2025 Fall',
        termZH: '2025 年秋季学期',
        week1Monday: '2025-09-08',
        termEndDate: '2026-01-23',
        teachingWeeks: 20,
        timezone: 'Asia/Shanghai'
      },

      'junior-second': {
        id: 'junior-second',
        labelEN: 'Junior Year - Second Semester',
        labelZH: '大三下（26春）',
        termEN: '2026 Spring',
        termZH: '2026 年春季学期',
        week1Monday: '2026-03-02',
        termEndDate: '2026-07-03',
        teachingWeeks: 18,
        timezone: 'Asia/Shanghai'
      },

      'senior-first': {
        id: 'senior-first',
        labelEN: 'Senior Year - First Semester',
        labelZH: '大四上（26秋）',
        termEN: '2026 Fall',
        termZH: '2026 年秋季学期',
        week1Monday: '2026-08-31',
        freshmanClassStartDate: '2026-09-07',
        termEndDate: '2027-01-15',
        teachingWeeks: 20,
        timezone: 'Asia/Shanghai'
      },

      'senior-second': {
        id: 'senior-second',
        labelEN: 'Senior Year - Second Semester',
        labelZH: '大四下（27春）',
        termEN: '2027 Spring',
        termZH: '2027 年春季学期',
        week1Monday: '2027-02-22',
        termEndDate: '',
        teachingWeeks: 18,
        timezone: 'Asia/Shanghai'
      }
    }
  };
})();
