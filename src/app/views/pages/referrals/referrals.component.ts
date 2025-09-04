// referrals.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReferralService, ReferralData, ReferralResponse, User, UserResponse, CreateReferralRequest } from '../../../services/referral.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss']
})
export class ReferralsComponent implements OnInit {
  // Tab state
  activeTab: 'given' | 'received' = 'given';
  
  // Data arrays
  givenReferrals: ReferralData[] = [];
  receivedReferrals: ReferralData[] = [];
  insideUsers: User[] = [];
  outsideUsers: User[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingUsers = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  
  // Modal state
  showConnectionSlip = false;
  connectionSlipForm!: FormGroup;
  selectedReferralType: 'inside' | 'outside' = 'inside';
  
  constructor(
    private referralService: ReferralService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadActiveTabData();
    this.loadUsers();
  }

  private initializeForm(): void {
    this.connectionSlipForm = this.fb.group({
      receiver_id: ['', Validators.required],
      referral_type: ['inside', Validators.required],
      told_them_you_would_will: [false, Validators.required],
      given_card: [false, Validators.required],
      referral: [''],
      mobile_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: [''],
      comments: [''],
      business_name: [''],
      rating: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  // Tab switching
  switchTab(tab: 'given' | 'received'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabData();
  }

  // Load data based on active tab
  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'given') {
        await this.loadGivenReferrals();
      } else {
        await this.loadReceivedReferrals();
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load given referrals
  async loadGivenReferrals(): Promise<void> {
    try {
      const response: ReferralResponse = await this.referralService.getGivenReferrals(this.currentPage, this.itemsPerPage);
      this.givenReferrals = response.data || [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading given referrals:', error);
      this.givenReferrals = [];
    }
  }

  // Load received referrals
  async loadReceivedReferrals(): Promise<void> {
    try {
      const response: ReferralResponse = await this.referralService.getReceivedReferrals(this.currentPage, this.itemsPerPage);
      this.receivedReferrals = response.data || [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading received referrals:', error);
      this.receivedReferrals = [];
    }
  }

  // Load users for dropdown
  async loadUsers(): Promise<void> {
    this.isLoadingUsers = true;
    try {
      const [insideResponse, outsideResponse] = await Promise.all([
        this.referralService.getInsideUsers(1, 100),
        this.referralService.getOutsideUsers(1, 100)
      ]);
      
      this.insideUsers = insideResponse.docs || [];
      this.outsideUsers = outsideResponse.docs || [];
    } catch (error) {
      console.error('Error loading users:', error);
      this.insideUsers = [];
      this.outsideUsers = [];
    } finally {
      this.isLoadingUsers = false;
    }
  }

  // Get current referrals based on active tab
  get currentReferrals(): ReferralData[] {
    return this.activeTab === 'given' ? this.givenReferrals : this.receivedReferrals;
  }

  // Get available users based on referral type
  get availableUsers(): User[] {
    return this.selectedReferralType === 'inside' ? this.insideUsers : this.outsideUsers;
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadActiveTabData();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal methods
  openConnectionSlip(): void {
    this.showConnectionSlip = true;
    this.connectionSlipForm.reset();
    this.connectionSlipForm.patchValue({
      referral_type: 'inside',
      told_them_you_would_will: false,
      given_card: false,
      rating: 1
    });
    this.selectedReferralType = 'inside';
  }

  closeConnectionSlip(): void {
    this.showConnectionSlip = false;
    this.connectionSlipForm.reset();
  }

  // Handle referral type change
  onReferralTypeChange(type: 'inside' | 'outside'): void {
    this.selectedReferralType = type;
    this.connectionSlipForm.patchValue({
      referral_type: type,
      receiver_id: ''
    });
  }

  // Submit connection slip
  async onSubmitConnectionSlip(): Promise<void> {
    if (this.connectionSlipForm.invalid) {
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      const formValue = this.connectionSlipForm.value;
      const referralData: CreateReferralRequest = {
        receiver_id: formValue.receiver_id,
        referral_type: formValue.referral_type,
        referral_status: {
          told_them_you_would_will: formValue.told_them_you_would_will,
          given_card: formValue.given_card
        },
        referral: formValue.referral || '',
        mobile_number: formValue.mobile_number,
        address: formValue.address || '',
        comments: formValue.comments || '',
        business_name: formValue.business_name || '',
        rating: formValue.rating
      };

      console.log('Creating referral with data:', referralData);
      
      await this.referralService.createReferral(referralData);
      this.closeConnectionSlip();
      
      // Refresh the current tab data
      await this.loadActiveTabData();
      
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  }

  // Utility methods
  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'filled' : 'empty');
    }
    return stars;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getReceiverName(referral: ReferralData): string {
    if (typeof referral.receiver_id === 'string') {
      return referral.receiver_id;
    }
    // If receiver_id is populated as object (like giver_id)
    return (referral.receiver_id as any)?.name || 'Unknown';
  }

  getConnectionName(referral: ReferralData): string {
    if (this.activeTab === 'given') {
      return this.getReceiverName(referral);
    } else {
      return referral.giver_id?.name || 'Unknown';
    }
  }
}