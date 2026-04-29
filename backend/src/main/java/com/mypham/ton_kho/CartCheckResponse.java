package com.mypham.ton_kho;

public record CartCheckResponse(boolean ok, Integer tonKhoCon, String error) {
    public static CartCheckResponse ok(int ton) {
        return new CartCheckResponse(true, ton, null);
    }
    public static CartCheckResponse outOfStock(int ton, String error) {
        return new CartCheckResponse(false, ton, error);
    }
}
