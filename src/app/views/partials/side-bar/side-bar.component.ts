// side-bar.component.ts - Updated to work with new design
import { AppWorker } from './../../../core/workers/app.worker';
import { Component, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { CustomerAuthService } from 'src/app/services/auth.service';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private router: Router,
    private storage: AppStorage,
    private authService: CustomerAuthService,
    public sideBarService: SideBarService,
    public appWorker: AppWorker,
    private sidebarStateService: SidebarStateService
  ) {}

  isSidebarOpen = false;
  isMobile = false;
  activeSubMenuIndex: number | null = null;
  private subscriptions: Subscription[] = [];

  // Icon mapping from Feather to Font Awesome - Updated for Figma design
  private iconMap: { [key: string]: string } = {
    'home': 'fas fa-home',
    'user-plus': 'fas fa-user-plus',
    'users': 'fas fa-users',
    'file-text': 'fas fa-file-alt',
    'calendar-check': 'fas fa-calendar-check',
    'file-import': 'fas fa-file-import',
    'globe': 'fas fa-globe',
    'map': 'fas fa-map',
    'map-pin': 'fas fa-map-marker-alt',
    'layers': 'fas fa-layer-group',
    'tag': 'fas fa-tag',
    'list': 'fas fa-list',
    'banner': 'fas fa-flag',
    'award': 'fas fa-trophy',
    'clipboard-list': 'fas fa-clipboard-list',
    'lock': 'fas fa-lock',
    'calendar': 'fas fa-calendar-alt',
    'check-circle': 'fas fa-check-circle',
    'check-square': 'fas fa-check-square',
    'corner-up-right': 'fas fa-external-link-alt',
    'corner-down-left': 'fas fa-reply',
    'message-square': 'fas fa-comment',
    'user-check': 'fas fa-user-check',
    'trending-up': 'fas fa-chart-line',
    'user': 'fas fa-user',
    'question-circle': 'fas fa-question-circle',
    'history': 'fas fa-history',
    'clipboard': 'fas fa-clipboard',
    'credit-card': 'fas fa-credit-card',
    'cog': 'fas fa-cog',
    'log-out': 'fas fa-sign-out-alt',
    'key': 'fas fa-key',
    'settings': 'fas fa-cogs',
    'layout': 'fas fa-th-large',
    'bar-chart': 'fas fa-chart-bar',
    'podcast': 'fas fa-podcast',
    'chevron-down': 'fas fa-chevron-down',
    'chevron-right': 'fas fa-chevron-right',
    'user-cog': 'fas fa-user-cog',
    'bell': 'fas fa-bell',
    'rss': 'fas fa-rss',
    'trophy': 'fas fa-trophy'
  };

  ngOnInit() {
    console.log('SideBarComponent: ngOnInit called');
    
    // Subscribe to sidebar state changes
    this.subscriptions.push(
      this.sidebarStateService.sidebarOpen$.subscribe(isOpen => {
        console.log('SideBarComponent: Received sidebar state change:', isOpen);
        this.isSidebarOpen = isOpen;
        this.updateBodyClass();
      })
    );

    this.subscriptions.push(
      this.sidebarStateService.isMobile$.subscribe(isMobile => {
        console.log('SideBarComponent: Received mobile state change:', isMobile);
        this.isMobile = isMobile;
      })
    );

    console.log('SideBarComponent: Initial state - isMobile:', this.isMobile, 'isSidebarOpen:', this.isSidebarOpen);
  }

  ngAfterViewInit() {
    // Component is ready
    console.log('Sidebar component ready - isMobile:', this.isMobile, 'isSidebarOpen:', this.isSidebarOpen);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Clean up body class
    document.body.classList.remove('sidebar-open');
  }

  // Update body class for better mobile sidebar control
  updateBodyClass() {
    if (this.isMobile && this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  toggleSidebar() {
    this.sidebarStateService.toggleSidebar();
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarStateService.closeSidebar();
    }
  }

  // Method to get Font Awesome class for given icon name
  getIconClass(iconName: string): string {
    return this.iconMap[iconName] || 'fas fa-circle';
  }

  // Enhanced submenu handling
  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
    console.log('Submenu toggled - activeIndex:', this.activeSubMenuIndex);
  }

  // Check if submenu is active
  isSubMenuActive(index: number): boolean {
    return this.activeSubMenuIndex === index;
  }

  // Enhanced navigation with automatic sidebar closing
  navigateToRoute(link: string, queryParams?: any) {
    console.log('Navigating to:', link, 'with params:', queryParams);
    this.router.navigate([link], { queryParams: queryParams || {} });
    this.closeSidebar();
  }

  // Check if any submenu item is active
  isParentMenuActive(submenu: any[]): boolean {
    return submenu.some(item => this.router.url.includes(item.link));
  }

  // Enhanced logout with confirmation
  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout?',
      'question'
    );
    if (confirm.isConfirmed) {
      await this.authService.logout();
    }
  };

  // Helper method to check if current route is active
  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // Method to handle keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Close sidebar on Escape key
    if (event.key === 'Escape' && this.isMobile && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  // Method to handle outside clicks
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.mobile-toggle-btn');
    
    // Close sidebar if clicking outside on mobile
    if (this.isMobile && this.isSidebarOpen && sidebar && toggleBtn) {
      if (!sidebar.contains(target) && !toggleBtn.contains(target)) {
        this.closeSidebar();
      }
    }
  }
}