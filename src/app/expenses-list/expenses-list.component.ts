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
  sortedColumn: string = 'date';
  isAscending: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 50;
  selectedExpense: Expense | undefined; // For modal content

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
          this.sortTable(this.sortedColumn);
        },
        error => {
          console.error('Error fetching expenses:', error);
        }
      );
  }

  getLoggedPersonDetails() {
    return this.personDetailsService.getPersonDetails();
  }

  sortTable(columnName: string): void {
    if (columnName === this.sortedColumn) {
      this.isAscending = !this.isAscending;
    } else {
      this.sortedColumn = columnName;
      this.isAscending = false;
    }

    this.expenses.sort((a, b) => {
      const aValue = this.getValueForSorting(a, columnName);
      const bValue = this.getValueForSorting(b, columnName);

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (columnName === 'date') {
        return this.isAscending ? new Date(aValue).getTime() - new Date(bValue).getTime() : new Date(bValue).getTime() - new Date(aValue).getTime();
      } else if (columnName === 'category') {
        return this.isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return this.isAscending ? aValue - bValue : bValue - aValue;
      }
    });
    this.updatePagination(); // Apply pagination after sorting
  }

  updatePagination(): void {
    this.currentPage = 1; // Reset to the first page after sorting
  }

  getPaginatedExpenses(): Expense[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.expenses.slice(startIndex, endIndex);
  }

  getValueForSorting(expense: Expense, columnName: string): any {
    switch (columnName) {
      case 'price': return expense.price;
      case 'category': return expense.category;
      case 'date': return expense.date;
      default: return '';
    }
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.expenses.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  openInfoModal(expense: Expense): void {
    this.selectedExpense = expense;
    this.showModal();
  }

  deleteExpense(): void {
    if (this.selectedExpense) {
      const expenseId = this.selectedExpense.id;
      if (expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
          this.closeModal();
          this.expenseService.deleteExpense(expenseId).subscribe(
            () => {
              this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
              this.updatePagination(); // Refresh the list after deletion
              this.selectedExpense = undefined; // Clear the selected expense
            },
            error => {
              console.error('Error deleting expense:', error);
            }
          );
        }
      } else {
        console.error('Expense ID is undefined or null');
      }
    }
  }

  showModal(): void {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeModal(): void {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.style.display = 'none'
    };
  }
}
