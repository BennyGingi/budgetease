"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { subMonths, format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"
import { toast } from "sonner"

// Type definitions
interface BudgetContextType {
  income: number
  expenses: number
  categories: SmartCategory[]
  recurringExpenses: RecurringExpense[]
  reminders: Reminder[]
  templates: BudgetTemplate[]
  currency: string
  exchangeRates: { [key: string]: number }
  savingsGoals: SavingsGoal[]
  budgetHistory: BudgetHistoryEntry[]
  sharedUsers: SharedUser[]
  insights: BudgetInsight[]
  currencyChangesCount: number
  updateIncome: (amount: number) => void
  updateExpenses: () => void
  updateCategories: (newCategories: Category[]) => void
  addRecurringExpense: (expense: RecurringExpense) => void
  removeRecurringExpense: (id: string) => void
  processRecurringExpenses: () => void
  addReminder: (reminder: Reminder) => void
  removeReminder: (id: string) => void
  updateReminder: (id: string, reminder: Partial<Reminder>) => void
  saveTemplate: (template: BudgetTemplate) => void
  loadTemplate: (templateId: string) => void
  removeTemplate: (templateId: string) => void
  setCurrency: (currency: string) => void
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number
  attachReceipt: (itemId: string, categoryId: string, receipt: Receipt) => void
  removeReceipt: (itemId: string, categoryId: string, receiptId: string) => void
  addSavingsGoal: (goal: SavingsGoal) => void
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
  removeSavingsGoal: (id: string) => void
  addSavingsContribution: (goalId: string, amount: number, type: "one-time" | "recurring") => void
  removeSavingsContribution: (goalId: string, contributionId: string) => void
  addSharedUser: (user: SharedUser) => void
  removeSharedUser: (userId: string) => void
  updateSharedUser: (userId: string, updates: Partial<SharedUser>) => void
  addCategoryKeyword: (categoryId: string, keyword: string) => void
  removeCategoryKeyword: (categoryId: string, keyword: string) => void
  suggestCategory: (expenseName: string) => string | null
  generateInsights: () => void
}

interface ExpenseItem {
  id: string
  name: string
  amount: number
  currency?: string
  receipts?: Receipt[]
  timestamp: string
}

interface Receipt {
  id: string
  imageUrl: string
  uploadDate: string
  description?: string
}

interface Category {
  id: string
  name: string
  budget: number
  spent: number
  items: ExpenseItem[]
  isExpanded?: boolean
}

interface RecurringExpense {
  id: string
  name: string
  amount: number
  categoryId: string
  frequency: "monthly" | "weekly" | "yearly"
  nextDueDate: string
  lastProcessed?: string
}

interface Reminder {
  id: string
  expenseId: string
  expenseName: string
  amount: number
  dueDate: string
  reminderDate: string
  notified: boolean
}

interface BudgetTemplate {
  id: string
  name: string
  description: string
  type: "custom" | "seasonal" | "lifestyle"
  income: number
  categories: Category[]
  recurringExpenses: RecurringExpense[]
  createdAt: string
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  createdAt: string
  contributions: SavingsContribution[]
  recurringContributions: RecurringSavingsContribution[]
}

interface SavingsContribution {
  id: string
  amount: number
  date: string
  type: "one-time" | "recurring"
}

interface RecurringSavingsContribution {
  id: string
  amount: number
  frequency: "weekly" | "monthly"
  startDate: string
  nextContributionDate: string
}

interface BudgetHistoryEntry {
  id: string
  date: string
  income: number
  expenses: number
  categories: Category[]
  currency: string
}

interface SharedUser {
  id: string
  name: string
  email: string
  sharePercentage: number
}

interface SmartCategory extends Category {
  timestamp: React.JSX.Element
  keywords: string[]
  suggestedBudget?: number
  sharedWith: SharedUser[]
}

interface BudgetInsight {
  id: string
  type: "saving" | "spending" | "recommendation"
  category?: string
  message: string
  potentialSavings?: number
  timestamp: string
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

let insightCounter = 0

const generateUniqueId = () => {
  insightCounter += 1
  return `insight-${Date.now()}-${insightCounter}`
}

const calculateMonthlyTrend = (items: ExpenseItem[], months = 3) => {
  const now = new Date()
  const trends: { month: string; total: number }[] = []

  for (let i = 0; i < months; i++) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = endOfMonth(subMonths(now, i))

    const monthlyTotal = items.reduce((sum, item) => {
      const itemDate = new Date(item.timestamp)
      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        return sum + item.amount
      }
      return sum
    }, 0)

    trends.unshift({
      month: format(monthStart, "MMM yyyy"),
      total: monthlyTotal,
    })
  }

  return trends
}

const analyzeSpendingPattern = (trends: { month: string; total: number }[]) => {
  if (trends.length < 2) return null

  const changes = trends.slice(1).map((current, index) => ({
    percentage: ((current.total - trends[index].total) / trends[index].total) * 100,
    month: current.month,
  }))

  return changes
}

const findUnusualSpending = (category: SmartCategory, averageSpending: number) => {
  const threshold = averageSpending * 1.5
  return category.items.filter((item) => item.amount > threshold)
}

const calculateSavingsPotential = (categories: SmartCategory[]) => {
  return categories.reduce((total, category) => {
    const unusedBudget = Math.max(0, category.budget - category.spent)
    return total + unusedBudget * 0.5
  }, 0)
}

const findRecurringPatterns = (items: ExpenseItem[]) => {
  const patterns: { [key: string]: number } = {}

  items.forEach((item) => {
    const key = item.name.toLowerCase()
    patterns[key] = (patterns[key] || 0) + 1
  })

  return Object.entries(patterns)
    .filter(([_, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
}

function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [income, setIncome] = useState(5000)
  const [expenses, setExpenses] = useState(3200)
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [currency, setCurrency] = useState("USD")
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({})
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistoryEntry[]>([])
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [insights, setInsights] = useState<BudgetInsight[]>([])
  const [currencyChangesCount, setCurrencyChangesCount] = useState(0)
  const [categories, setCategories] = useState<SmartCategory[]>([
    {
      id: "1",
      name: "Rent",
      budget: 1500,
      spent: 1500,
      items: [{ id: "1-1", name: "Monthly Rent", amount: 1500, timestamp: new Date().toISOString() }],
      keywords: ["rent", "apartment", "housing", "lease"],
      sharedWith: [],
      timestamp: <span>{new Date().toLocaleDateString()}</span>,
    },
    {
      id: "2",
      name: "Utilities",
      budget: 200,
      spent: 180,
      items: [
        { id: "2-1", name: "Electricity", amount: 100, timestamp: new Date().toISOString() },
        { id: "2-2", name: "Water", amount: 80, timestamp: new Date().toISOString() },
      ],
      keywords: ["electricity", "water", "gas", "utility", "power", "bill"],
      sharedWith: [],
      timestamp: <span>{new Date().toLocaleDateString()}</span>,
    },
    {
      id: "3",
      name: "Groceries",
      budget: 400,
      spent: 350,
      items: [
        { id: "3-1", name: "Weekly Shopping", amount: 250, timestamp: new Date().toISOString() },
        { id: "3-2", name: "Special Items", amount: 100, timestamp: new Date().toISOString() },
      ],
      keywords: ["grocery", "food", "supermarket", "market", "shopping"],
      sharedWith: [],
      timestamp: <span>{new Date().toLocaleDateString()}</span>,
    },
  ])

  const updateIncome = (amount: number) => {
    setIncome(amount)
  }

  const updateExpenses = () => {
    const totalExpenses = categories.reduce((sum, category) => sum + category.spent, 0)
    setExpenses(totalExpenses)
  }

  const updateCategories = (newCategories: Category[]) => {
    // Ensure all categories have the required timestamp property for SmartCategory
    const updatedCategories = newCategories.map((category) => {
      if ("timestamp" in category) {
        return category as SmartCategory
      }
      return {
        ...category,
        timestamp: <span>{new Date().toLocaleDateString()}</span>,
        keywords: (category as any).keywords || [],
        sharedWith: (category as any).sharedWith || [],
      } as SmartCategory
    })

    setCategories(updatedCategories)
    const totalExpenses = newCategories.reduce((sum, category) => sum + category.spent, 0)
    setExpenses(totalExpenses)
  }

  const addRecurringExpense = (expense: RecurringExpense) => {
    setRecurringExpenses([...recurringExpenses, expense])

    const reminderDate = new Date(expense.nextDueDate)
    reminderDate.setDate(reminderDate.getDate() - 3)

    const reminder: Reminder = {
      id: Date.now().toString(),
      expenseId: expense.id,
      expenseName: expense.name,
      amount: expense.amount,
      dueDate: expense.nextDueDate,
      reminderDate: reminderDate.toISOString(),
      notified: false,
    }

    addReminder(reminder)
  }

  const removeRecurringExpense = (id: string) => {
    setRecurringExpenses(recurringExpenses.filter((expense) => expense.id !== id))
    setReminders(reminders.filter((reminder) => reminder.expenseId !== id))
  }

  const addReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder])
  }

  const removeReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  // Use useCallback to memoize the updateReminder function
  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((reminders) =>
      reminders.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder)),
    )
  }, [])

  const attachReceipt = (itemId: string, categoryId: string, receipt: Receipt) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                receipts: [...(item.receipts || []), receipt],
              }
            }
            return item
          }),
        }
      }
      return category
    })
    updateCategories(updatedCategories)
  }

  const removeReceipt = (itemId: string, categoryId: string, receiptId: string) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map((item) => {
            if (item.id === itemId && item.receipts) {
              return {
                ...item,
                receipts: item.receipts.filter((r) => r.id !== receiptId),
              }
            }
            return item
          }),
        }
      }
      return category
    })
    updateCategories(updatedCategories)
  }

  const saveTemplate = (template: BudgetTemplate) => {
    setTemplates((prevTemplates) => {
      const existingIndex = prevTemplates.findIndex((t) => t.id === template.id)
      if (existingIndex >= 0) {
        const updatedTemplates = [...prevTemplates]
        updatedTemplates[existingIndex] = template
        return updatedTemplates
      }
      return [...prevTemplates, template]
    })
  }

  const loadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setIncome(template.income)

      // Convert template categories to SmartCategories
      const smartCategories = template.categories.map((category) => ({
        ...category,
        timestamp: <span>{new Date().toLocaleDateString()}</span>,
        keywords: (category as any).keywords || [],
        sharedWith: (category as any).sharedWith || [],
      })) as SmartCategory[]

      setCategories(smartCategories)
      setRecurringExpenses(template.recurringExpenses)
      updateExpenses()
    }
  }

  const removeTemplate = (templateId: string) => {
    setTemplates(templates.filter((template) => template.id !== templateId))
  }

  const addSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals([...savingsGoals, goal])
  }

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)))
  }

  const removeSavingsGoal = (id: string) => {
    setSavingsGoals((goals) => goals.filter((goal) => goal.id !== id))
  }

  const addSavingsContribution = (goalId: string, amount: number, type: "one-time" | "recurring") => {
    setSavingsGoals((goals) =>
      goals.map((goal) => {
        if (goal.id === goalId) {
          const contribution = {
            id: Date.now().toString(),
            amount,
            date: new Date().toISOString(),
            type,
          }
          return {
            ...goal,
            currentAmount: goal.currentAmount + amount,
            contributions: [...goal.contributions, contribution],
          }
        }
        return goal
      }),
    )
  }

  const removeSavingsContribution = (goalId: string, contributionId: string) => {
    setSavingsGoals((goals) =>
      goals.map((goal) => {
        if (goal.id === goalId) {
          const contribution = goal.contributions.find((c) => c.id === contributionId)
          if (contribution) {
            return {
              ...goal,
              currentAmount: goal.currentAmount - contribution.amount,
              contributions: goal.contributions.filter((c) => c.id !== contributionId),
            }
          }
        }
        return goal
      }),
    )
  }

  // Use useCallback to memoize the processRecurringExpenses function
  const processRecurringExpenses = useCallback(() => {
    const today = new Date()
    const updatedRecurring: RecurringExpense[] = []
    let updatedCategories = [...categories]

    recurringExpenses.forEach((expense) => {
      const dueDate = new Date(expense.nextDueDate)
      if (dueDate <= today && (!expense.lastProcessed || new Date(expense.lastProcessed) < dueDate)) {
        updatedCategories = updatedCategories.map((category) => {
          if (category.id === expense.categoryId) {
            return {
              ...category,
              spent: category.spent + expense.amount,
              items: [
                ...category.items,
                {
                  id: Date.now().toString(),
                  name: `${expense.name} (Automatic)`,
                  amount: expense.amount,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          }
          return category
        })

        const nextDueDate = new Date(dueDate)
        switch (expense.frequency) {
          case "monthly":
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            break
          case "weekly":
            nextDueDate.setDate(nextDueDate.getDate() + 7)
            break
          case "yearly":
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
            break
        }

        const reminderDate = new Date(nextDueDate)
        reminderDate.setDate(reminderDate.getDate() - 3)

        const newReminder: Reminder = {
          id: Date.now().toString(),
          expenseId: expense.id,
          expenseName: expense.name,
          amount: expense.amount,
          dueDate: nextDueDate.toISOString(),
          reminderDate: reminderDate.toISOString(),
          notified: false,
        }

        addReminder(newReminder)

        updatedRecurring.push({
          ...expense,
          nextDueDate: nextDueDate.toISOString(),
          lastProcessed: today.toISOString(),
        })
      } else {
        updatedRecurring.push(expense)
      }
    })

    setRecurringExpenses(updatedRecurring)
    updateCategories(updatedCategories)
  }, [categories, recurringExpenses])

  const addCategoryKeyword = (categoryId: string, keyword: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              keywords: [...category.keywords, keyword.toLowerCase()],
            }
          : category,
      ),
    )
  }

  const removeCategoryKeyword = (categoryId: string, keyword: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              keywords: category.keywords.filter((k) => k !== keyword.toLowerCase()),
            }
          : category,
      ),
    )
  }

  const suggestCategory = (expenseName: string) => {
    const words = expenseName.toLowerCase().split(" ")
    let bestMatch: { categoryId: string | null; matches: number } = {
      categoryId: null,
      matches: 0,
    }

    categories.forEach((category) => {
      const matches = category.keywords.reduce((count, keyword) => {
        return words.some((word) => word.includes(keyword)) ? count + 1 : count
      }, 0)

      if (matches > bestMatch.matches) {
        bestMatch = { categoryId: category.id, matches }
      }
    })

    return bestMatch.categoryId
  }

  const addSharedUser = (user: SharedUser) => {
    setSharedUsers((prev) => [...prev, user])
  }

  const removeSharedUser = (userId: string) => {
    setSharedUsers((prev) => prev.filter((user) => user.id !== userId))
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        sharedWith: category.sharedWith.filter((user) => user.id !== userId),
      })),
    )
  }

  const updateSharedUser = (userId: string, updates: Partial<SharedUser>) => {
    setSharedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)))
  }

  // Use useCallback to memoize the generateInsights function
  const generateInsights = useCallback(() => {
    const newInsights: BudgetInsight[] = []

    categories.forEach((category) => {
      const spendingRatio = category.spent / category.budget

      if (spendingRatio > 0.9) {
        newInsights.push({
          id: generateUniqueId(),
          type: "spending",
          category: category.name,
          message: `You've used ${Math.round(spendingRatio * 100)}% of your ${
            category.name
          } budget. Consider reducing expenses in this category.`,
          timestamp: new Date().toISOString(),
        })
      }

      const monthlySpending = category.items.reduce((total, item) => {
        const itemDate = new Date(item.timestamp)
        const currentDate = new Date()
        if (itemDate.getMonth() === currentDate.getMonth()) {
          return total + item.amount
        }
        return total
      }, 0)

      if (monthlySpending < category.budget * 0.5) {
        newInsights.push({
          id: generateUniqueId(),
          type: "saving",
          category: category.name,
          message: `Great job! You're well under budget in ${category.name}. Consider moving some funds to savings.`,
          potentialSavings: category.budget - monthlySpending,
          timestamp: new Date().toISOString(),
        })
      }
    })

    setInsights(newInsights)
  }, [categories])

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return amount

    const inUSD = amount / exchangeRates[fromCurrency]
    return inUSD * exchangeRates[toCurrency]
  }

  const updateCurrencyValues = (oldCurrency: string, newCurrency: string) => {
    // Update income
    const newIncome = convertAmount(income, oldCurrency, newCurrency)
    setIncome(newIncome)

    // Update categories and their items
    const updatedCategories = categories.map((category) => ({
      ...category,
      budget: convertAmount(category.budget, oldCurrency, newCurrency),
      spent: convertAmount(category.spent, oldCurrency, newCurrency),
      items: category.items.map((item) => ({
        ...item,
        amount: convertAmount(item.amount, oldCurrency, newCurrency),
      })),
    }))
    setCategories(updatedCategories)

    // Update recurring expenses
    const updatedRecurringExpenses = recurringExpenses.map((expense) => ({
      ...expense,
      amount: convertAmount(expense.amount, oldCurrency, newCurrency),
    }))
    setRecurringExpenses(updatedRecurringExpenses)

    // Update reminders
    const updatedReminders = reminders.map((reminder) => ({
      ...reminder,
      amount: convertAmount(reminder.amount, oldCurrency, newCurrency),
    }))
    setReminders(updatedReminders)

    // Update savings goals
    const updatedSavingsGoals = savingsGoals.map((goal) => ({
      ...goal,
      targetAmount: convertAmount(goal.targetAmount, oldCurrency, newCurrency),
      currentAmount: convertAmount(goal.currentAmount, oldCurrency, newCurrency),
      contributions: goal.contributions.map((contribution) => ({
        ...contribution,
        amount: convertAmount(contribution.amount, oldCurrency, newCurrency),
      })),
      recurringContributions: goal.recurringContributions.map((contribution) => ({
        ...contribution,
        amount: convertAmount(contribution.amount, oldCurrency, newCurrency),
      })),
    }))
    setSavingsGoals(updatedSavingsGoals)

    // Update total expenses
    const newExpenses = updatedCategories.reduce((sum, category) => sum + category.spent, 0)
    setExpenses(newExpenses)
  }

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/USD`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.result === "success") {
          setExchangeRates(data.conversion_rates)
        } else {
          throw new Error("Failed to fetch exchange rates")
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error)
        toast.error("Failed to fetch exchange rates. Some features may be limited.")
      }
    }

    fetchExchangeRates()
    const interval = setInterval(fetchExchangeRates, 3600000) // Update every hour

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()

      reminders.forEach((reminder) => {
        if (!reminder.notified) {
          const reminderDate = new Date(reminder.reminderDate)
          if (reminderDate <= now) {
            if ("Notification" in window) {
              if (Notification.permission === "default") {
                Notification.requestPermission()
              }

              if (Notification.permission === "granted") {
                new Notification("Upcoming Bill Reminder", {
                  body: `${reminder.expenseName} - $${reminder.amount} due on ${new Date(reminder.dueDate).toLocaleDateString()}`,
                  icon: "/favicon.ico",
                })

                updateReminder(reminder.id, { notified: true })
              }
            }
          }
        }
      })
    }

    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [reminders, updateReminder]) // Added updateReminder to the dependency array

  useEffect(() => {
    const interval = setInterval(processRecurringExpenses, 86400000)
    return () => clearInterval(interval)
  }, [processRecurringExpenses]) // Added processRecurringExpenses to the dependency array

  useEffect(() => {
    const historyEntry: BudgetHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      income,
      expenses,
      categories,
      currency,
    }
    setBudgetHistory((prev) => [...prev, historyEntry])
  }, [income, expenses, categories, currency])

  useEffect(() => {
    generateInsights()
    const interval = setInterval(generateInsights, 86400000)
    return () => clearInterval(interval)
  }, [generateInsights]) // Added generateInsights to the dependency array

  const handleCurrencyChange = (newCurrency: string) => {
    if (Object.keys(exchangeRates).length === 0) {
      toast.error("Exchange rates are not available. Please try again later.")
      return
    }

    const oldCurrency = currency
    setCurrency(newCurrency)
    updateCurrencyValues(oldCurrency, newCurrency)
    setCurrencyChangesCount((prev) => prev + 1)
  }

  const contextValue: BudgetContextType = {
    income,
    expenses,
    categories,
    recurringExpenses,
    reminders,
    templates,
    currency,
    exchangeRates,
    savingsGoals,
    budgetHistory,
    sharedUsers,
    insights,
    currencyChangesCount,
    updateIncome,
    updateExpenses,
    updateCategories,
    addRecurringExpense,
    removeRecurringExpense,
    processRecurringExpenses,
    addReminder,
    removeReminder,
    updateReminder,
    saveTemplate,
    loadTemplate,
    removeTemplate,
    setCurrency: handleCurrencyChange,
    convertAmount,
    attachReceipt,
    removeReceipt,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    addSavingsContribution,
    removeSavingsContribution,
    addSharedUser,
    removeSharedUser,
    updateSharedUser,
    addCategoryKeyword,
    removeCategoryKeyword,
    suggestCategory,
    generateInsights,
  }

  return <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>
}

function useBudget() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider")
  }
  return context
}

export { BudgetProvider, useBudget, BudgetContext }
export type { BudgetTemplate, Reminder }

