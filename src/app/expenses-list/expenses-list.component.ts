import { Component, OnInit } from '@angular/core';
import { PersonDetailsService } from '../services/person-details-service/person-details.service';
import { ExpenseService } from '../services/expense-service/expense.service';
import { Expense } from '../model/expense';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {

  expenses: Expense[] = [];
  sortedColumn: string = 'price';
  isAscending: boolean = true;
  showDetails: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private personDetailsService: PersonDetailsService,
    private expenseService: ExpenseService,
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    const loggedPerson = this.getLoggedPersonDetails();
    if (loggedPerson) {
      this.getAllExpenses(loggedPerson.id);
    } else {
      console.error('Logged-in person details not available.');
    }
  }

  getAllExpenses(personId: number): void {
    this.expenseService.getAllExpenses(personId)
      .subscribe(
        expenses => {
          this.expenses = expenses;
          this.sortTable(this.sortedColumn); // Initial sort after loading expenses
        },
        error => {
          console.error('Error fetching expenses:', error);
        }
      );
  }

  editExpense(expense: Expense): void {
    // Implement edit functionality
  }

  deleteExpense(expenseId: number | undefined): void {
    if (!expenseId) {
      console.error('Expense ID is undefined or null');
      return;
    }

    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(expenseId).subscribe(
        () => {
          this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
        },
        error => {
          console.error('Error deleting expense:', error);
        }
      );
    }
  }

  getLoggedPersonDetails() {
    return this.personDetailsService.getPersonDetails();
  }

  sortTable(columnName: string): void {
    if (columnName === this.sortedColumn) {
      this.isAscending = !this.isAscending;
    } else {
      this.sortedColumn = columnName;
      this.isAscending = true;
    }

    // Perform sorting for the current page's expenses only
    const paginatedExpenses = this.getPaginatedExpenses();
    paginatedExpenses.sort((a, b) => {
      const aValue = this.getValueForSorting(a, columnName);
      const bValue = this.getValueForSorting(b, columnName);

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (columnName === 'date') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return this.isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (columnName === 'category') {
        // Use localeCompare for category sorting
        return this.isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return this.isAscending ? aValue - bValue : bValue - aValue;
      }
    });

    // Update the displayed expenses after sorting
    this.expenses.splice((this.currentPage - 1) * this.itemsPerPage, this.itemsPerPage, ...paginatedExpenses);
  }


  getValueForSorting(expense: Expense, columnName: string): any {
    switch (columnName) {
      case 'price':
        return expense.price;
      case 'category':
        return expense.category;
      case 'date':
        return expense.date;
      default:
        return '';
    }
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  getPaginatedExpenses(): Expense[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.expenses.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.expenses.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }
}
