import { create } from 'zustand'

interface UIState {
  /** 课表当前选中的班级 */
  scheduleClassId?: string
  setScheduleClassId: (id?: string) => void

  /** 学生模块当前展开的班级 */
  activeClassId?: string
  setActiveClassId: (id?: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  scheduleClassId: undefined,
  setScheduleClassId: (id) => set({ scheduleClassId: id }),
  activeClassId: undefined,
  setActiveClassId: (id) => set({ activeClassId: id }),
}))
