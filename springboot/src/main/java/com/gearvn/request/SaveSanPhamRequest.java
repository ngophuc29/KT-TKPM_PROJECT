package com.gearvn.request;

public class SaveSanPhamRequest {
    private String tenSanPham;
    private String heDieuHanh;
    private String manHinh;
    private String hinhAnh;
    private String ram;
    private String rom;
    private String cpu;
    private String cardDoHoa;
    private String pin;
    private String trongLuong;
    private String mauSac;
    private String loaiPin;
    private String tinhNangKhac;
    private String tenNCC;
    private String diaChiNCC;
    private String emailNCC;
    private String tenThuongHieu;
    private String tenHangMuc;
    private String donGiaNhapNCC;
    private String chiphiLuuKho;
    private String chiPhiQuanLy;
    private String phantramloinhan;
    private String soLuong;
    
    public SaveSanPhamRequest() {
        super();
    }

    public SaveSanPhamRequest(String tenSanPham, String heDieuHanh, String manHinh, String hinhAnh, String ram,
                              String rom, String cpu, String cardDoHoa, String pin, String trongLuong, String mauSac,
                              String loaiPin, String tinhNangKhac, String tenNCC, String diaChiNCC, String emailNCC,
                              String tenThuongHieu, String tenHangMuc, String donGiaNhapNCC) {
        this.tenSanPham = tenSanPham;
        this.heDieuHanh = heDieuHanh;
        this.manHinh = manHinh;
        this.hinhAnh = hinhAnh;
        this.ram = ram;
        this.rom = rom;
        this.cpu = cpu;
        this.cardDoHoa = cardDoHoa;
        this.pin = pin;
        this.trongLuong = trongLuong;
        this.mauSac = mauSac;
        this.loaiPin = loaiPin;
        this.tinhNangKhac = tinhNangKhac;
        this.tenNCC = tenNCC;
        this.diaChiNCC = diaChiNCC;
        this.emailNCC = emailNCC;
        this.tenThuongHieu = tenThuongHieu;
        this.tenHangMuc = tenHangMuc;
        this.donGiaNhapNCC = donGiaNhapNCC;
    }

    public SaveSanPhamRequest(String tenSanPham, String heDieuHanh, String manHinh, String hinhAnh, String ram,
			String rom, String cpu, String cardDoHoa, String pin, String trongLuong, String mauSac, String loaiPin,
			String tinhNangKhac, String tenNCC, String diaChiNCC, String emailNCC, String tenThuongHieu,
			String tenHangMuc, String donGiaNhapNCC, String chiphiLuuKho, String chiPhiQuanLy, String phantramloinhan) {
		super();
		this.tenSanPham = tenSanPham;
		this.heDieuHanh = heDieuHanh;
		this.manHinh = manHinh;
		this.hinhAnh = hinhAnh;
		this.ram = ram;
		this.rom = rom;
		this.cpu = cpu;
		this.cardDoHoa = cardDoHoa;
		this.pin = pin;
		this.trongLuong = trongLuong;
		this.mauSac = mauSac;
		this.loaiPin = loaiPin;
		this.tinhNangKhac = tinhNangKhac;
		this.tenNCC = tenNCC;
		this.diaChiNCC = diaChiNCC;
		this.emailNCC = emailNCC;
		this.tenThuongHieu = tenThuongHieu;
		this.tenHangMuc = tenHangMuc;
		this.donGiaNhapNCC = donGiaNhapNCC;
		this.chiphiLuuKho = chiphiLuuKho;
		this.chiPhiQuanLy = chiPhiQuanLy;
		this.phantramloinhan = phantramloinhan;
	}

	public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getHeDieuHanh() {
        return heDieuHanh;
    }

    public void setHeDieuHanh(String heDieuHanh) {
        this.heDieuHanh = heDieuHanh;
    }

    public String getManHinh() {
        return manHinh;
    }

    public void setManHinh(String manHinh) {
        this.manHinh = manHinh;
    }

    public String getHinhAnh() {
        return hinhAnh;
    }

    public void setHinhAnh(String hinhAnh) {
        this.hinhAnh = hinhAnh;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getRom() {
        return rom;
    }

    public void setRom(String rom) {
        this.rom = rom;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getCardDoHoa() {
        return cardDoHoa;
    }

    public void setCardDoHoa(String cardDoHoa) {
        this.cardDoHoa = cardDoHoa;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public String getTrongLuong() {
        return trongLuong;
    }

    public void setTrongLuong(String trongLuong) {
        this.trongLuong = trongLuong;
    }

    public String getMauSac() {
        return mauSac;
    }

    public void setMauSac(String mauSac) {
        this.mauSac = mauSac;
    }

    public String getLoaiPin() {
        return loaiPin;
    }

    public void setLoaiPin(String loaiPin) {
        this.loaiPin = loaiPin;
    }

    public String getTinhNangKhac() {
        return tinhNangKhac;
    }

    public void setTinhNangKhac(String tinhNangKhac) {
        this.tinhNangKhac = tinhNangKhac;
    }

    public String getTenNCC() {
        return tenNCC;
    }

    public void setTenNCC(String tenNCC) {
        this.tenNCC = tenNCC;
    }

    public String getDiaChiNCC() {
        return diaChiNCC;
    }

    public void setDiaChiNCC(String diaChiNCC) {
        this.diaChiNCC = diaChiNCC;
    }

    public String getEmailNCC() {
        return emailNCC;
    }

    public void setEmailNCC(String emailNCC) {
        this.emailNCC = emailNCC;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public String getTenHangMuc() {
        return tenHangMuc;
    }

    public void setTenHangMuc(String tenHangMuc) {
        this.tenHangMuc = tenHangMuc;
    }

    public String getDonGiaNhapNCC() {
        return donGiaNhapNCC;
    }

    public void setDonGiaNhapNCC(String donGiaNhapNCC) {
        this.donGiaNhapNCC = donGiaNhapNCC;
    }

	public String getChiphiLuuKho() {
		return chiphiLuuKho;
	}

	public void setChiphiLuuKho(String chiphiLuuKho) {
		this.chiphiLuuKho = chiphiLuuKho;
	}

	public String getChiPhiQuanLy() {
		return chiPhiQuanLy;
	}

	public void setChiPhiQuanLy(String chiPhiQuanLy) {
		this.chiPhiQuanLy = chiPhiQuanLy;
	}

	public String getPhantramloinhan() {
		return phantramloinhan;
	}

	public void setPhantramloinhan(String phantramloinhan) {
		this.phantramloinhan = phantramloinhan;
	}

	public String getSoLuong() {
		return soLuong;
	}

	public void setSoLuong(String soLuong) {
		this.soLuong = soLuong;
	}
	
    
}
