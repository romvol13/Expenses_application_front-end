import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Expense } from '../model/expense';
import { CategoryService } from '../services/category-service/category.service';
import { PersonDetailsService } from '../services/person-details-service/person-details.service';
import { ExpenseService } from '../services/expense-service/expense.service';
import { NgForm } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  expenses: Expense[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  dataPoints: any[] = [];
  totalMonthlyExpenses: number = 0;
  currentMonthName: string = '';
  currentDate: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  chartOptions: any = {
    title: {
      text: "Monthly expenses",
      fontFamily: 'Roboto, sans-serif'
    },
    animationEnabled: true,
    axisY: {
      includeZero: true,
      suffix: "€"
    },
    data: [{
      type: "bar",
      indexLabel: "{y}",
      yValueFormatString: "#,###.##€",
      dataPoints: this.dataPoints
    }],
    backgroundColor: "transparent"
  };

  constructor(
    private categoryService: CategoryService,
    private personDetailsService: PersonDetailsService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeDashboard();
  }

  initializeDashboard(): void {
    this.getCategories();
    this.getCurrentMonthName();
    this.currentDate = new Date().toISOString().split('T')[0];
    this.getCurrentMonthTotalExpenses();
  }

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(
        categories => {
          this.categories = categories;
          this.updateChartData();
        },
        error => console.error('Error fetching categories:', error)
      );
  }

  getCurrentMonthName(): void {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    this.currentMonthName = months[currentDate.getMonth()];
  }

  getExpensesForCategory(category: string, personId: number): Observable<Expense[]> {
    return this.expenseService.getExpensesByCategory(category, personId);
  }

  getCurrentMonthTotalExpenses(): void {
    const loggedPerson = this.getLoggedPersonDetails();
    if (loggedPerson) {
      this.expenseService.getCurrentMonthTotal(loggedPerson.id)
        .subscribe(
          response => {
            this.totalMonthlyExpenses = parseFloat(response.total.toFixed(2));
            this.updateChartData();
          },
          error => console.error('Error fetching total expenses:', error)
        );
    } else {
      this.handleNoLoggedPerson();
    }
  }

  isCurrentMonthExpense(expenseDate: string): boolean {
    const expense = new Date(expenseDate);
    const currentDate = new Date();
    return expense.getMonth() === currentDate.getMonth() && expense.getFullYear() === currentDate.getFullYear();
  }

  addExpense(newExpenseForm: NgForm): void {
    if (newExpenseForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.clearMessagesAfterTimeout();
      return;
    }

    const loggedPerson = this.getLoggedPersonDetails();
    if (loggedPerson) {
      const newExpense = this.createNewExpense(newExpenseForm, loggedPerson.id);
      this.expenseService.addExpense(newExpense, loggedPerson.id)
        .subscribe(
          () => {
            this.handleSuccess(newExpenseForm);
            this.getCurrentMonthTotalExpenses();
            this.updateChartData();
          },
          error => this.handleError(error)
        );
    } else {
      this.handleNoLoggedPerson();
    }
  }

  createNewExpense(newExpenseForm: NgForm, personId: number): Expense {
    return {
      category: newExpenseForm.value.category,
      price: newExpenseForm.value.price,
      description: newExpenseForm.value.description,
      date: newExpenseForm.value.date || this.currentDate,
      personId
    };
  }

  handleSuccess(newExpenseForm: NgForm): void {
    this.successMessage = 'Expense added successfully!';
    this.errorMessage = null;
    newExpenseForm.resetForm({ date: this.currentDate });
    this.clearMessagesAfterTimeout();
  }

  handleError(error: any): void {
    console.error('Error adding expense:', error);
    this.successMessage = null;
    this.errorMessage = error.error.message || 'Error adding expense. Please try again.';
    this.clearMessagesAfterTimeout();
  }

  handleNoLoggedPerson(): void {
    console.log('Logged-in person details not available.');
    this.successMessage = null;
    this.errorMessage = 'Logged-in person details not available.';
    this.clearMessagesAfterTimeout();
  }

  clearMessagesAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 2000);
  }

  updateChartData(): void {
    const loggedPerson = this.getLoggedPersonDetails();
    if (!loggedPerson) {
      console.log('Logged-in person details not available.');
      return;
    }

    const observables: Observable<Expense[]>[] = this.categories.map(category =>
      this.getExpensesForCategory(category, loggedPerson.id)
    );

    forkJoin(observables).subscribe(
      (expensesArrays: Expense[][]) => {
        this.dataPoints = expensesArrays.map((expenses: Expense[], index: number) => {
          const currentMonthExpenses = expenses.filter(expense => this.isCurrentMonthExpense(expense.date));
          const totalExpense = currentMonthExpenses.reduce((total, expense) => total + expense.price, 0);
          return {
            label: this.categories[index],
            y: parseFloat(totalExpense.toFixed(2))
          };
        }).filter(dataPoint => dataPoint.y > 0);

        this.dataPoints.sort((a, b) => a.y - b.y);
        this.updateChartOptions();
      },
      error => console.error('Error updating chart data:', error)
    );
  }

  updateChartOptions(): void {
    this.chartOptions = {
      title: {
        text: "Monthly expenses",
        fontFamily: 'Roboto, sans-serif'
      },
      animationEnabled: true,
      axisY: {
        includeZero: true,
        suffix: "€"
      },
      data: [{
        type: "bar",
        indexLabel: "{y}",
        yValueFormatString: "#,###.##€",
        dataPoints: this.dataPoints
      }],
      backgroundColor: "transparent"
    };
    this.cdr.detectChanges();
  }

  getLoggedPersonDetails() {
    return this.personDetailsService.getPersonDetails();
  }
}
