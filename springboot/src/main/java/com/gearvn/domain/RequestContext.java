package com.gearvn.domain;

public class RequestContext {
	private static final ThreadLocal<Integer> USER_ID = new ThreadLocal<>();
	
	private RequestContext() {
	}
	
	public static void start() {
        USER_ID.remove();
    }
	
	public static void setUserId(Integer userId) {
		USER_ID.set(userId);
	}
	
	public static Integer getUserId() {
        return USER_ID.get();
      }
}	
