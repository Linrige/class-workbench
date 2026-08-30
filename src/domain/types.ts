export type ID = string

/* ---------------- 班级模板（首页「班级管理」） ---------------- */
export interface ClassTemplate {
  id: ID
  name: string
  /** 学生名单，一项一个姓名 */
  studentNames: string[]
  createdAt: number
  updatedAt: number
}

/* ---------------- 班级（学生模块） ---------------- */
export interface ClassEntity {
  id: ID
  name: string
  grade?: string
  /** 糖果色 key */
  color: string
  /** 来源模板 id（由「导入班级」生成时写入） */
  templateId?: ID
  archived: boolean
  createdAt: number
}

/* ---------------- 学生 ---------------- */
export interface Student {
  id: ID
  classId: ID
  name: string
  no?: string
  gender?: 'male' | 'female'
  groupName?: string
  createdAt: number
}

/* ---------------- 作业 ---------------- */
export type HomeworkStatus = 'active' | 'archived'

export interface HomeworkEntity {
  id: ID
  title: string
  classIds: ID[]
  subject?: string
  /** yyyy-MM-dd */
  assignDate: string
  dueDate?: string
  note?: string
  status: HomeworkStatus
  createdAt: number
}

/** 0 待完成 · 1 已完成 · 2 订正 · 3 缺交 */
export type SubmitStatus = 0 | 1 | 2 | 3

export interface HomeworkRecord {
  id: ID
  homeworkId: ID
  studentId: ID
  status: SubmitStatus
  updatedAt: number
}

/* ---------------- 考勤 ---------------- */
/** 考勤时段，如早操 / 早读 / 课堂，在设置中维护 */
export interface AttendanceSlot {
  id: ID
  name: string
  order: number
  createdAt: number
}

/** 0 到达 · 1 迟到 · 2 缺勤 · 3 请假（无记录时视为到达） */
export type AttendStatus = 0 | 1 | 2 | 3

export interface AttendanceRecord {
  id: ID
  /** yyyy-MM-dd */
  date: string
  /** 考勤时段 id */
  slotId: ID
  studentId: ID
  status: AttendStatus
  updatedAt: number
}

/* ---------------- 名言 ---------------- */
export interface Quote {
  id: ID
  text: string
  author: string
  createdAt: number
}

/* ---------------- 待办 ---------------- */
/** 0 不高 · 1 普通 · 2 重要 */
export type Priority = 0 | 1 | 2

export interface Todo {
  id: ID
  title: string
  /** yyyy-MM-dd */
  date: string
  priority: Priority
  done: boolean
  doneAt?: number
  createdAt: number
}

/* ---------------- 备忘录 ---------------- */
export type MemoColor = 'pink' | 'blue' | 'yellow' | 'green' | 'purple'

export interface Memo {
  id: ID
  content: string
  /** 预设 key 或自定义 #RRGGBB */
  color: string
  pinned: boolean
  order: number
  createdAt: number
  updatedAt: number
}

/* ---------------- 课表 ---------------- */
export interface ScheduleCell {
  id: ID
  classId: ID
  /** 1 = 周一 ... 7 = 周日 */
  day: number
  /** 第几节，从 1 开始 */
  period: number
  subject: string
  note?: string
  color?: string
}

export interface Stroke {
  color: string
  width: number
  /** 扁平化的坐标数组 [x0,y0,x1,y1,...]，便于压缩存储 */
  points: number[]
}

export interface ScheduleDoodle {
  id: ID
  classId: ID
  strokes: Stroke[]
  updatedAt: number
}

/* ---------------- 设置 ---------------- */
export interface PeriodConfig {
  index: number
  name: string
  startTime: string
  endTime: string
}

export interface AppSettings {
  periods: PeriodConfig[]
  showWeekend: boolean
  defaultClassId?: ID
  theme: 'light' | 'candy-night'
  /** 我任教的教学科目，用于首页统计「我的课程」 */
  mySubjects: string[]
}

export interface SettingRow {
  key: string
  value: unknown
}
