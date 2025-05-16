package com.gearvn.request;

public class SaveThuongHieuRequest {

	
	private String tenThuongHieu;

	public SaveThuongHieuRequest() {
		super();
		// TODO Auto-generated constructor stub
	}

	public SaveThuongHieuRequest(String tenThuongHieu) {
		super();
		this.tenThuongHieu = tenThuongHieu;
	}

	public String getTenThuongHieu() {
		return tenThuongHieu;
	}

	public void setTenThuongHieu(String tenThuongHieu) {
		this.tenThuongHieu = tenThuongHieu;
	}
	
}
