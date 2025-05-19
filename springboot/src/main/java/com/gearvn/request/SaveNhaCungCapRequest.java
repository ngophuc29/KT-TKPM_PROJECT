package com.gearvn.request;

public class SaveNhaCungCapRequest {
    private String tenNCC;
    private String diaChi;
    private String email;
    
	public SaveNhaCungCapRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SaveNhaCungCapRequest(String tenNCC, String diaChi, String email) {
		super();
		this.tenNCC = tenNCC;
		this.diaChi = diaChi;
		this.email = email;
	}
	public String getTenNCC() {
		return tenNCC;
	}
	public void setTenNCC(String tenNCC) {
		this.tenNCC = tenNCC;
	}
	public String getDiaChi() {
		return diaChi;
	}
	public void setDiaChi(String diaChi) {
		this.diaChi = diaChi;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}

     
}
