package com.gearvn.entities;

public class ApiException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int statusCode;

    public ApiException( String errorMessage) {
        super(errorMessage);
        
    }
    
	public ApiException() {
		super("Api Exception");
		
	}
    public int getStatusCode() {
        return statusCode;
    }
}
