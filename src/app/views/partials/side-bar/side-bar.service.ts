import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'GBS Customer Portal',
      menus: [
      
        // {
        //   title: 'My Profile',
        //   link: 'profile',
        //   icon: 'user',
        // },
        // {
        //   title: 'Members',
        //   link: 'members',
        //   icon: 'users',
        // },
        {
           title: 'Referrals',
           link: 'referrals',
           icon: 'corner-up-right',
        },
        {
          title: 'tyfcbslip',
          link: 'tyfcbslip',
          icon: 'trending-up',
        },

        {
          title: 'Events',
          icon: 'calendar',
          hasSubmenu: true,
          submenu: [
            {
              title: 'Upcoming Events',
              link: 'events/upcoming',
              icon: 'calendar-check',
            },
            {
              title: 'My Events',
              link: 'events/my-events',
              icon: 'calendar',
            },
            {
              title: 'Event History',
              link: 'events/history',
              icon: 'history',
            },
          ]
        },
        {
          title: 'Testimonials',
          icon: 'message-square',
          hasSubmenu: true,
          submenu: [
            {
              title: 'My Testimonials',
              link: 'testimonials/my',
              icon: 'message-square',
            },
            {
              title: 'Give Testimonial',
              link: 'testimonials/give',
              icon: 'message-square',
            },
            {
              title: 'All Testimonials',
              link: 'testimonials/all',
              icon: 'message-square',
            },
          ]
        },
        {
          title: 'One-to-One',
          link: 'one-to-one',
          icon: 'user-check',
        },
        {
          title: 'TYFCB',
          icon: 'trending-up',
          hasSubmenu: true,
          submenu: [
            {
              title: 'Give TYFCB',
              link: 'tyfcb/give',
              icon: 'trending-up',
            },
            {
              title: 'TYFCB History',
              link: 'tyfcb/history',
              icon: 'history',
            },
          ]
        },
        {
          title: 'Notifications',
          link: 'notifications',
          icon: 'bell',
        },
        {
          title: 'Leaderboard',
          link: 'leaderboard',
          icon: 'award',
        },
        {
          title: 'Near By',
          link: 'nearby',
          icon: 'map-pin',
        },
        {
          title: 'Podcasts',
          icon: 'podcast',
          hasSubmenu: true,
          submenu: [
            {
              title: 'All Podcasts',
              link: 'podcasts/all',
              icon: 'podcast',
            },
            {
              title: 'Book Podcast',
              link: 'podcasts/book',
              icon: 'calendar-check',
            },
            {
              title: 'My Bookings',
              link: 'podcasts/my-bookings',
              icon: 'calendar',
            },
          ]
        },
      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }

  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}