import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  private PATH1: string = `${environment.baseURL}`;
  
  // User Management
  public auth = {
    login: `${this.PATH}/auth/login`,
    verifyMobile: `${this.PATH}/auth/verify-mobile`,
    resendOtp: `${this.PATH}/auth/resend-mobile-otp`,
    logout: `${this.PATH}/auth/logout`,
    refreshToken: `${this.PATH}/auth/refresh-token`
  };

  public dashboard = {
    getUserDataCounts: `${this.PATH}/getUserDataCounts`,
  };

  public events = {
    nextNearestEvent: `${this.PATH}/next-nearest-event`
  };

  public notifications = {
    getNotifications: `${this.PATH}/getNotificationsById`
  };

  public profile = {
    getProfileCompletion: `${this.PATH}/getProfileCompletion`
  };

  public testimonials = {
    getTestimonialByUserId: `${this.PATH}/getTestimonialByUserId`
  };

  // Referral Management
  public referrals = {
    getGivenReferral: `${this.PATH1}/mobile/get-given-referral`,
    getReceivedReferral: `${this.PATH1}/mobile/get-received-referral`,
    getInsideUsers: `${this.PATH1}/mobile/get-inside-users`,
    getOutsideUsers: `${this.PATH1}/mobile/get-outside-users`,
    createReferral: `${this.PATH1}/mobile/create-referral`,
    updateReferral: `${this.PATH1}/mobile/update-referral`,
    deleteReferral: `${this.PATH1}/mobile/delete-referral`,
    getReferralStats: `${this.PATH1}/mobile/referral-stats`
  };

  // Tyfcb Management
  public tyfcb = {
    getTyfcbById: `${this.PATH1}/mobile/getTyfcbById`,
    createTyfcb: `${this.PATH1}/mobile/create-tyfcb`,
    getTyfcbsByGiverId: `${this.PATH1}/mobile/get-tyfcbs-by-giverId`,
    getTyfcbsByReceiverId: `${this.PATH1}/mobile/get-tyfcbs-by-receiverId`
  };

 // Gratitude Management
  public gratitude = {
    getTestimonialsByReceiverId: `${this.PATH1}/mobile/get-testimonials-byReceiver`,
    getTestimonialRequestsByReceiverId: `${this.PATH1}/mobile/get-testimonial-req/receiver`,
    createTestimonial: `${this.PATH1}/mobile/create-testimonials`,
    getAllUsersData: `${this.PATH1}/mobile/getAllUsersData`
  };

// router.get('/get-testimonials-byReceiver/:receiverId', tenstimonialController.getTestimonialsByReceiverId);
// router.get("/get-testimonial-req/receiver/:receiverId", authMiddleware, testimonialReqController.getTestimonialRequestsByReceiverId);
// router.post("/create-testimonials", validator(testimonialValidator.testimonialValidation), tenstimonialController.createTestimonial);

// router.get("/getAllUsersData", userController.getAllUsersData);

}

export let apiEndpoints = new ApiEndpoints();