import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Ticket } from '../../services/ticket';

@Component({
  selector: 'app-raiseticket',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './raiseticket.html',
  styleUrl: './raiseticket.css'
})
export class Raiseticket {

  // Form fields
  title: string = '';
  description: string = '';
  category: string = '';
  email: string = '';
  department: string = '';
  location: string = '';

  isLoading = false;

 constructor(
    private router: Router,
    private ticketService: Ticket ) {}
  
    // Submit ticket
  onSubmit(): void {

    // Check required fields
    if (
      !this.title.trim() ||
      !this.description.trim() ||
      !this.category ||
      !this.email.trim() ||
      !this.department ||
      !this.location.trim()
    ) {
      alert('Please fill in all fields.');
      return;
    }

    // Check minimum lengths
    if (this.title.trim().length < 5) {
      alert('Ticket title must contain at least 5 characters.');
      return;
    }

    if (this.description.trim().length < 10) {
      alert('Description must contain at least 10 characters.');
      return;
    }

     this.isLoading = true;

    // Create ticket object
    const ticketData = {
      title: this.title.trim(),
      description: this.description.trim(),
      category: this.category,
      email: this.email.trim(),
      department: this.department,
      location: this.location.trim()
    };

    this.ticketService.createTicket(ticketData).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('Ticket saved:', response);

        alert(
          response.message ||
          `Ticket submitted successfully! Ticket ID: ${
            response.ticket?.ticketId || response.ticketId || 'Created'
          }`
        );

        this.resetForm();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Ticket submission error:', error);

        alert(
          error.error?.message ||
          `Failed to submit ticket. HTTP status: ${error.status}`
        );
      }
    });
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.category = '';
    this.email = '';
    this.department = '';
    this.location = '';
  }
}