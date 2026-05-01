"use client";

import { useEffect, useState } from "react";

const API = "https://provinces.open-api.vn/api/v1";

type Unit = { code: number; name: string };
type Province = Unit & { districts?: Unit[] };
type District = Unit & { wards?: Unit[] };

export type VietnamAddress = {
  tinh: string;
  quan: string;
  phuong: string;
  fullText: string;
};

type Props = {
  value?: VietnamAddress;
  onChange: (addr: VietnamAddress) => void;
  required?: boolean;
};

export function VietnamAddressPicker({ value, onChange, required = true }: Props) {
  const [provinces, setProvinces] = useState<Unit[]>([]);
  const [districts, setDistricts] = useState<Unit[]>([]);
  const [wards, setWards] = useState<Unit[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  const [hydrated, setHydrated] = useState({ p: false, d: false, w: false });

  useEffect(() => {
    setLoadingProv(true);
    fetch(`${API}/p/`)
      .then((r) => r.json())
      .then((data: Province[]) =>
        setProvinces(data.map((p) => ({ code: p.code, name: p.name }))),
      )
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProv(false));
  }, []);

  useEffect(() => {
    if (provinceCode === "") {
      setDistricts([]);
      return;
    }
    setLoadingDist(true);
    fetch(`${API}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data: Province) =>
        setDistricts(
          (data.districts ?? []).map((d) => ({ code: d.code, name: d.name })),
        ),
      )
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDist(false));
  }, [provinceCode]);

  useEffect(() => {
    if (districtCode === "") {
      setWards([]);
      return;
    }
    setLoadingWard(true);
    fetch(`${API}/d/${districtCode}?depth=2`)
      .then((r) => r.json())
      .then((data: District) =>
        setWards((data.wards ?? []).map((w) => ({ code: w.code, name: w.name }))),
      )
      .catch(() => setWards([]))
      .finally(() => setLoadingWard(false));
  }, [districtCode]);

  function handleProvince(code: string) {
    const num = code ? Number(code) : "";
    setProvinceCode(num);
    setDistrictCode("");
    setWardCode("");
    emit(num as number | "", "", "");
  }
  function handleDistrict(code: string) {
    const num = code ? Number(code) : "";
    setDistrictCode(num);
    setWardCode("");
    emit(provinceCode, num as number | "", "");
  }
  function handleWard(code: string) {
    const num = code ? Number(code) : "";
    setWardCode(num);
    emit(provinceCode, districtCode, num as number | "");
  }

  function emit(p: number | "", d: number | "", w: number | "") {
    const tinh = provinces.find((x) => x.code === p)?.name ?? "";
    const quan = districts.find((x) => x.code === d)?.name ?? "";
    const phuong = wards.find((x) => x.code === w)?.name ?? "";
    const parts = [phuong, quan, tinh].filter(Boolean);
    onChange({ tinh, quan, phuong, fullText: parts.join(", ") });
  }

  useEffect(() => {
    if (hydrated.p) return;
    if (!value?.tinh || provinces.length === 0) return;
    const match = provinces.find((p) => p.name === value.tinh);
    if (match) setProvinceCode(match.code);
    setHydrated((h) => ({ ...h, p: true }));
  }, [provinces, value, hydrated.p]);

  useEffect(() => {
    if (hydrated.d) return;
    if (!value?.quan || districts.length === 0) return;
    const match = districts.find((d) => d.name === value.quan);
    if (match) setDistrictCode(match.code);
    setHydrated((h) => ({ ...h, d: true }));
  }, [districts, value, hydrated.d]);

  useEffect(() => {
    if (hydrated.w) return;
    if (!value?.phuong || wards.length === 0) return;
    const match = wards.find((w) => w.name === value.phuong);
    if (match) setWardCode(match.code);
    setHydrated((h) => ({ ...h, w: true }));
  }, [wards, value, hydrated.w]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Select
        label="Tỉnh / Thành"
        required={required}
        loading={loadingProv}
        value={provinceCode === "" ? "" : String(provinceCode)}
        onChange={handleProvince}
        options={provinces}
        placeholder="— Chọn tỉnh/thành —"
      />
      <Select
        label="Quận / Huyện"
        required={required}
        loading={loadingDist}
        value={districtCode === "" ? "" : String(districtCode)}
        onChange={handleDistrict}
        options={districts}
        placeholder={
          provinceCode === "" ? "Chọn tỉnh trước" : "— Chọn quận/huyện —"
        }
        disabled={provinceCode === ""}
      />
      <Select
        label="Phường / Xã"
        required={required}
        loading={loadingWard}
        value={wardCode === "" ? "" : String(wardCode)}
        onChange={handleWard}
        options={wards}
        placeholder={districtCode === "" ? "Chọn quận trước" : "— Chọn phường/xã —"}
        disabled={districtCode === ""}
      />
    </div>
  );
}

function Select({
  label,
  required,
  loading,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  loading?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: Unit[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
        {label} {required && <span className="text-rose-600">*</span>}
        {loading && <span className="ml-1 text-[color:var(--color-muted)]">…</span>}
      </label>
      <select
        required={required}
        disabled={disabled || loading}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
