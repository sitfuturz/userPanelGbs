import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReferralService } from '../../../services/referral.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';

declare var bootstrap: any;

interface ReferralData {
  _id: string;
  giver_id: any;
  receiver_id: string;
  referral_type: string;
  referral_status: {
    told_them_you_would_will: boolean;
    given_card: boolean;
  };
  referral: string;
  mobile_number: string;
  address: string;
  comments: string;
  business_name: string;
  rating: number;
  createdAt: string;
}

interface ReferralResponse {
  success: boolean;
  message: string;
  data: ReferralData[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  profilePic: string;
  chapter_name: string;
  business_name: string;
  address: string;
}

@Component({
  selector: 'app-referral',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit, AfterViewInit {
  activeTab: string = 'given';
  loading: boolean = false;
  showAddForm: boolean = false;
  
  givenReferrals: ReferralResponse = {
    success: false,
    message: '',
    data: [],
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };

  receivedReferrals: ReferralResponse = {
    success: false,
    message: '',
    data: [],
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };

  insideUsers: User[] = [];
  outsideUsers: User[] = [];
  selectedUsers: User[] = [];
   Math = Math;
  
  currentPage: number = 1;
  pageSize: number = 10;
  imageUrl: string = environment.imageUrl;
  
  referralForm!: FormGroup;
  addModal: any;

  private searchSubject = new Subject<string>();

  constructor(
    private referralService: ReferralService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadGivenReferrals();
    this.loadUsers();
  }

  
  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('addReferralModal');
      if (modalElement) {
        this.addModal = new bootstrap.Modal(modalElement);
      }
    }, 300);
  }

  initializeForm(): void {
    this.referralForm = this.fb.group({
      receiver_id: ['', Validators.required],
      referral_type: ['inside', Validators.required],
      referral_status: this.fb.group({
        told_them_you_would_will: [false, Validators.required],
        given_card: [false, Validators.required]
      }),
      referral: [''],
      mobile_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: [''],
      comments: [''],
      business_name: [''],
      rating: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    // Watch referral_type changes to update user list
    this.referralForm.get('referral_type')?.valueChanges.subscribe(value => {
      this.updateUsersList(value);
      this.referralForm.patchValue({ receiver_id: '' });
    });
  }

  async loadGivenReferrals(page: number = 1): Promise<void> {
    this.loading = true;
    try {
      this.givenReferrals = await this.referralService.getGivenReferrals(page);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading given referrals:', error);
      swalHelper.showToast('Failed to load given referrals', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadReceivedReferrals(page: number = 1): Promise<void> {
    this.loading = true;
    try {
      this.receivedReferrals = await this.referralService.getReceivedReferrals(page);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading received referrals:', error);
      swalHelper.showToast('Failed to load received referrals', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadUsers(): Promise<void> {
    try {
      const [insideResponse, outsideResponse] = await Promise.all([
        this.referralService.getInsideUsers(),
        this.referralService.getOutsideUsers()
      ]);
      
      this.insideUsers = insideResponse.docs || [];
      this.outsideUsers = outsideResponse.docs || [];
      this.updateUsersList(this.referralForm.get('referral_type')?.value || 'inside');
    } catch (error) {
      console.error('Error loading users:', error);
      swalHelper.showToast('Failed to load users', 'error');
    }
  }

  updateUsersList(referralType: string): void {
    this.selectedUsers = referralType === 'inside' ? this.insideUsers : this.outsideUsers;
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    
    if (tab === 'given') {
      this.loadGivenReferrals(1);
    } else {
      this.loadReceivedReferrals(1);
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    
    if (this.activeTab === 'given') {
      this.loadGivenReferrals(page);
    } else {
      this.loadReceivedReferrals(page);
    }
  }

  getCurrentReferrals(): ReferralResponse {
    return this.activeTab === 'given' ? this.givenReferrals : this.receivedReferrals;
  }

  getImageUrl(path: string): string {
    if (!path) return '/assets/default-avatar.png';
    return `${this.imageUrl}${path}`;
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.referralForm.reset();
    this.referralForm.patchValue({
      referral_type: 'inside',
      rating: 1,
      referral_status: {
        told_them_you_would_will: false,
        given_card: false
      }
    });
    this.updateUsersList('inside');
    
    if (this.addModal) {
      this.addModal.show();
    }
  }

  closeAddForm(): void {
    this.showAddForm = false;
    if (this.addModal) {
      this.addModal.hide();
    }
  }

  async onSubmitReferral(): Promise<void> {
    if (this.referralForm.invalid) {
      Object.keys(this.referralForm.controls).forEach(key => {
        const control = this.referralForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    try {
      const formData = this.referralForm.value;
      
      // Format data according to API requirements
      const requestData = {
        receiver_id: formData.receiver_id,
        referral_type: formData.referral_type,
        referral_status: {
          told_them_you_would_will: formData.told_them_you_would_will || false,
          given_card: formData.given_card || false
        },
        referral: formData.referral || '',
        mobile_number: formData.mobile_number,
        address: formData.address || '',
        comments: formData.comments || '',
        business_name: formData.business_name || '',
        rating: formData.rating
      };
      
      await this.referralService.createReferral(requestData);
      
      swalHelper.showToast('Referral created successfully', 'success');
      this.closeAddForm();
      this.loadGivenReferrals(1); // Refresh the list
      this.currentPage = 1;
    } catch (error) {
      console.error('Error creating referral:', error);
      swalHelper.showToast('Failed to create referral', 'error');
    } finally {
      this.loading = false;
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}