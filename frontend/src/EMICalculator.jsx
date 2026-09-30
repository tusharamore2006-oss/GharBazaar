import React, { useState, useMemo } from "react";
import "./EMICalculator.css";

// Bank partners with real Indian market rates and features
const BANK_PARTNERS = [
  {
    id: "sbi",
    name: "State Bank of India",
    shortName: "SBI",
    logoBadge: "🏛️",
    badgeColor: "#1e3a8a",
    minRate: 8.50,
    maxRate: 9.15,
    processingFee: "0.35% (Min ₹2,000, Max ₹10,000)",
    maxTenure: 30,
    maxFunding: "Up to 90% of property cost",
    highlight: "Special 0.05% discount for women borrowers. Nil prepayment penalties.",
    rating: 4.8,
    tag: "Lowest PSU Rate",
    popular: true,
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    shortName: "HDFC",
    logoBadge: "🏦",
    badgeColor: "#004c8f",
    minRate: 8.55,
    maxRate: 9.25,
    processingFee: "Up to 0.50% (Max ₹3,000)",
    maxTenure: 30,
    maxFunding: "Up to 85% of property cost",
    highlight: "Instant digital in-principle sanction in 30 mins with minimal documentation.",
    rating: 4.9,
    tag: "Fastest Approval",
    popular: true,
  },
  {
    id: "icici",
    name: "ICICI Bank",
    shortName: "ICICI",
    logoBadge: "🏢",
    badgeColor: "#b91c1c",
    minRate: 8.60,
    maxRate: 9.35,
    processingFee: "0.50% - 1.00%",
    maxTenure: 30,
    maxFunding: "Up to 90% of property cost",
    highlight: "Pre-approved home loans for salary account holders with doorstep guidance.",
    rating: 4.8,
    tag: "Pre-Approved Offers",
    popular: false,
  },
  {
    id: "bob",
    name: "Bank of Baroda",
    shortName: "BoB",
    logoBadge: "🔶",
    badgeColor: "#ea580c",
    minRate: 8.40,
    maxRate: 9.10,
    processingFee: "Nil to 0.25% promotional waiver",
    maxTenure: 30,
    maxFunding: "Up to 90% of property cost",
    highlight: "Baroda Home Loan Advantage linked to savings account for max interest savings.",
    rating: 4.7,
    tag: "Best Entry Rate",
    popular: false,
  },
  {
    id: "axis",
    name: "Axis Bank",
    shortName: "Axis",
    logoBadge: "🟣",
    badgeColor: "#831843",
    minRate: 8.65,
    maxRate: 9.40,
    processingFee: "Up to 1.00% (Min ₹10,000)",
    maxTenure: 30,
    maxFunding: "Up to 85% of property cost",
    highlight: "Shubh Aarambh scheme: 12 EMI waiver on regular and timely repayments.",
    rating: 4.6,
    tag: "12 EMI Waiver",
    popular: false,
  },
  {
    id: "kotak",
    name: "Kotak Mahindra Bank",
    shortName: "Kotak",
    logoBadge: "🔴",
    badgeColor: "#be123c",
    minRate: 8.70,
    maxRate: 9.45,
    processingFee: "0.50% + GST",
    maxTenure: 25,
    maxFunding: "Up to 85% of property cost",
    highlight: "Dedicated loan manager, fully digital journey, transparent processing.",
    rating: 4.7,
    tag: "Doorstep Support",
    popular: false,
  },
];

const formatINR = (val) => {
  const num = Math.round(Number(val) || 0);
  return num.toLocaleString("en-IN");
};

const formatLakhCrore = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `₹${formatINR(num)}`;
};

function EMICalculator({
  initialPrice = null,
  propertyTitle = "",
  showBankList = true,
  embedded = false,
  onApplySuccess = null,
}) {
  // If initialPrice is passed (e.g. from PropertyDetails), compute default 80% loan
  const hasPropertyPrice = initialPrice && Number(initialPrice) > 0;
  const propertyVal = hasPropertyPrice ? Number(initialPrice) : 5000000;

  // Down payment percentage (default 20%)
  const [downPaymentPct, setDownPaymentPct] = useState(20);

  // Loan Amount
  const [loanAmount, setLoanAmount] = useState(() => {
    if (hasPropertyPrice) {
      return Math.round(propertyVal * 0.8);
    }
    return 4000000; // 40 Lakhs default
  });

  // Annual Interest Rate %
  const [interestRate, setInterestRate] = useState(8.5);

  // Tenure in years
  const [tenureYears, setTenureYears] = useState(20);

  // Selected Bank for focus
  const [selectedBank, setSelectedBank] = useState("sbi");

  // Show Amortization schedule table
  const [showAmortization, setShowAmortization] = useState(false);

  // Loan Application / Inquire Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyBank, setApplyBank] = useState(BANK_PARTNERS[0]);
  const [applyFormData, setApplyFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    employment: "Salaried",
    monthlyIncome: "",
    existingEmi: "",
  });
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  // When down payment percentage changes on property details
  const handleDownPaymentChange = (pct) => {
    setDownPaymentPct(pct);
    const newLoan = Math.round(propertyVal * (1 - pct / 100));
    setLoanAmount(newLoan);
  };

  // EMI Math Calculation
  // E = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  const calculation = useMemo(() => {
    const P = Math.max(10000, Number(loanAmount) || 0);
    const annualRate = Math.max(1, Number(interestRate) || 8.5);
    const r = annualRate / 12 / 100; // monthly rate
    const n = Math.max(1, Number(tenureYears) * 12); // total months

    const numerator = P * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    const emi = denominator === 0 ? 0 : Math.round(numerator / denominator);

    const totalAmount = emi * n;
    const totalInterest = Math.max(0, totalAmount - P);

    const principalPct = totalAmount > 0 ? Math.round((P / totalAmount) * 100) : 50;
    const interestPct = 100 - principalPct;

    // Minimum suggested net monthly salary (assuming 50% FOIR)
    const suggestedSalary = Math.round(emi * 2);

    return {
      monthlyEmi: emi,
      totalInterest,
      totalAmount,
      principalPct,
      interestPct,
      suggestedSalary,
      tenureMonths: n,
    };
  }, [loanAmount, interestRate, tenureYears]);

  // Yearly Amortization Schedule preview
  const amortizationSchedule = useMemo(() => {
    if (!showAmortization) return [];

    let balance = Number(loanAmount);
    const monthlyRate = interestRate / 12 / 100;
    const monthlyEmi = calculation.monthlyEmi;
    const schedule = [];

    const years = Math.min(30, tenureYears);

    for (let yr = 1; yr <= years; yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = Math.min(balance, monthlyEmi - interestForMonth);

        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
      }

      schedule.push({
        year: yr,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        totalPaid: Math.round(yearlyPrincipal + yearlyInterest),
        balanceRemaining: Math.max(0, Math.round(balance)),
      });

      if (balance <= 0) break;
    }

    return schedule;
  }, [loanAmount, interestRate, tenureYears, calculation.monthlyEmi, showAmortization]);

  // Handle Bank Selection to update rate
  const handleSelectBank = (bank) => {
    setSelectedBank(bank.id);
    setInterestRate(bank.minRate);
  };

  // Open Application Modal
  const handleOpenApplyModal = (bank = null) => {
    const b = bank || BANK_PARTNERS.find((item) => item.id === selectedBank) || BANK_PARTNERS[0];
    setApplyBank(b);
    setApplySubmitted(false);
    setIsApplyModalOpen(true);
  };

  const handleApplyFormSubmit = (e) => {
    e.preventDefault();
    const generatedId = `GB-LOAN-${Math.floor(100000 + Math.random() * 900000)}`;
    setApplicationId(generatedId);
    setApplySubmitted(true);
    if (onApplySuccess) {
      onApplySuccess({
        applicationId: generatedId,
        bank: applyBank.name,
        amount: loanAmount,
      });
    }
  };

  return (
    <div className={`emi-calculator-wrapper ${embedded ? "embedded-mode" : "standalone-mode"}`}>
      {/* HEADER */}
      <div className="emi-calc-header">
        <div className="header-badge">
          <span className="badge-dot"></span> Smart Loan Assist
        </div>
        <h2 className="emi-calc-title">
          {hasPropertyPrice ? "Property Loan & EMI Estimator" : "Home Loan EMI Calculator"}
        </h2>
        <p className="emi-calc-subtitle">
          {hasPropertyPrice
            ? `Plan your financing for "${propertyTitle || "this property"}" with real-time interest rates from India's top lending banks.`
            : "Estimate your monthly mortgage payments, total interest outflow, and compare offers across top Indian banks."}
        </p>
      </div>

      {/* PROPERTY PRICE DOWN PAYMENT BANNER (IF EMBEDDED WITH PROPERTY) */}
      {hasPropertyPrice && (
        <div className="property-downpayment-card">
          <div className="dp-info">
            <span className="dp-label">Property Value</span>
            <strong className="dp-value">₹{formatINR(propertyVal)}</strong>
            <span className="dp-badge">({formatLakhCrore(propertyVal)})</span>
          </div>

          <div className="dp-controls">
            <div className="dp-slider-header">
              <span>Down Payment: <strong>{downPaymentPct}%</strong> (₹{formatINR(propertyVal * (downPaymentPct / 100))})</span>
              <span className="loan-fraction">Loan: <strong>{100 - downPaymentPct}%</strong> (₹{formatINR(loanAmount)})</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={downPaymentPct}
              onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
              className="custom-range-slider dp-slider"
            />
            <div className="dp-chips">
              {[10, 15, 20, 25, 30, 40].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`dp-chip ${downPaymentPct === pct ? "active" : ""}`}
                  onClick={() => handleDownPaymentChange(pct)}
                >
                  {pct}% DP
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR MAIN GRID */}
      <div className="emi-calc-grid">
        {/* LEFT COLUMN: CONTROLS & SLIDERS */}
        <div className="emi-controls-card">
          {/* CONTROL 1: LOAN AMOUNT */}
          <div className="calc-group">
            <div className="calc-group-header">
              <label htmlFor="input-loan-amount" className="calc-label">
                Loan Amount Required
              </label>
              <div className="calc-val-input-wrap">
                <span className="currency-prefix">₹</span>
                <input
                  id="input-loan-amount"
                  type="number"
                  min="100000"
                  max="100000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="calc-numeric-input"
                />
              </div>
            </div>

            <input
              type="range"
              min="200000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="custom-range-slider"
            />

            <div className="range-meta">
              <span>₹2 Lakh</span>
              <span className="highlight-current">{formatLakhCrore(loanAmount)}</span>
              <span>₹2 Crore</span>
            </div>

            {/* Quick Loan Presets */}
            <div className="quick-presets">
              {[2500000, 4000000, 6000000, 8000000, 12000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-btn ${loanAmount === preset ? "active" : ""}`}
                  onClick={() => setLoanAmount(preset)}
                >
                  {formatLakhCrore(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* CONTROL 2: INTEREST RATE */}
          <div className="calc-group">
            <div className="calc-group-header">
              <label htmlFor="input-interest-rate" className="calc-label">
                Annual Interest Rate
              </label>
              <div className="calc-val-input-wrap">
                <input
                  id="input-interest-rate"
                  type="number"
                  min="6.5"
                  max="15.0"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="calc-numeric-input"
                />
                <span className="percent-suffix">% P.A.</span>
              </div>
            </div>

            <input
              type="range"
              min="6.5"
              max="14.0"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="custom-range-slider"
            />

            <div className="range-meta">
              <span>6.5%</span>
              <span className="highlight-current">{interestRate}%</span>
              <span>14.0%</span>
            </div>

            {/* Bank Quick Interest Rate Selectors */}
            <div className="quick-presets rate-presets">
              {BANK_PARTNERS.slice(0, 4).map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  className={`preset-btn rate-chip ${interestRate === bank.minRate ? "active" : ""}`}
                  onClick={() => handleSelectBank(bank)}
                >
                  <span>{bank.shortName}</span>
                  <strong>{bank.minRate}%</strong>
                </button>
              ))}
            </div>
          </div>

          {/* CONTROL 3: TENURE */}
          <div className="calc-group">
            <div className="calc-group-header">
              <label htmlFor="input-tenure" className="calc-label">
                Loan Tenure (Duration)
              </label>
              <div className="calc-val-input-wrap">
                <input
                  id="input-tenure"
                  type="number"
                  min="1"
                  max="30"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="calc-numeric-input"
                />
                <span className="percent-suffix">Years ({tenureYears * 12} Mos)</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="custom-range-slider"
            />

            <div className="range-meta">
              <span>1 Year</span>
              <span className="highlight-current">{tenureYears} Years</span>
              <span>30 Years</span>
            </div>

            {/* Tenure Presets */}
            <div className="quick-presets">
              {[5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`preset-btn ${tenureYears === yr ? "active" : ""}`}
                  onClick={() => setTenureYears(yr)}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EMI SUMMARY CARD & BREAKDOWN */}
        <div className="emi-result-card">
          <div className="result-card-inner">
            <span className="result-tagline">Estimated Monthly Installment</span>

            {/* MONTHLY EMI HERO DISPLAY */}
            <div className="hero-emi-display">
              <span className="emi-currency">₹</span>
              <span className="emi-number">{formatINR(calculation.monthlyEmi)}</span>
              <span className="emi-period">/ month</span>
            </div>

            {/* VISUAL RATIO BAR (PRINCIPAL VS INTEREST) */}
            <div className="ratio-bar-container">
              <div className="ratio-labels">
                <div className="ratio-label-item principal-item">
                  <span className="dot dot-principal"></span>
                  <span>Principal: <strong>{calculation.principalPct}%</strong></span>
                </div>
                <div className="ratio-label-item interest-item">
                  <span className="dot dot-interest"></span>
                  <span>Interest: <strong>{calculation.interestPct}%</strong></span>
                </div>
              </div>

              <div className="progress-bar-track">
                <div
                  className="progress-fill-principal"
                  style={{ width: `${calculation.principalPct}%` }}
                  title={`Principal Amount: ₹${formatINR(loanAmount)}`}
                />
                <div
                  className="progress-fill-interest"
                  style={{ width: `${calculation.interestPct}%` }}
                  title={`Total Interest: ₹${formatINR(calculation.totalInterest)}`}
                />
              </div>
            </div>

            {/* DETAILED STATS GRID */}
            <div className="calc-stats-grid">
              <div className="stat-box">
                <span className="stat-title">Principal Loan Amount</span>
                <strong className="stat-value">₹{formatINR(loanAmount)}</strong>
                <small className="stat-helper">{formatLakhCrore(loanAmount)}</small>
              </div>

              <div className="stat-box">
                <span className="stat-title">Total Interest Payable</span>
                <strong className="stat-value text-accent">₹{formatINR(calculation.totalInterest)}</strong>
                <small className="stat-helper">{formatLakhCrore(calculation.totalInterest)}</small>
              </div>

              <div className="stat-box stat-highlight-box">
                <span className="stat-title">Total Repayment Amount</span>
                <strong className="stat-value">₹{formatINR(calculation.totalAmount)}</strong>
                <small className="stat-helper">Principal + Total Interest</small>
              </div>

              <div className="stat-box">
                <span className="stat-title">Suggested Min. Monthly Salary</span>
                <strong className="stat-value text-emerald">₹{formatINR(calculation.suggestedSalary)}</strong>
                <small className="stat-helper">Based on standard 50% FOIR limit</small>
              </div>
            </div>

            {/* ACTION CTAS */}
            <div className="calc-action-buttons">
              <button
                type="button"
                className="btn-apply-loan-primary"
                onClick={() => handleOpenApplyModal()}
              >
                <span>🚀 Check Loan Eligibility Free</span>
              </button>

              <button
                type="button"
                className="btn-amortization-toggle"
                onClick={() => setShowAmortization(!showAmortization)}
              >
                <span>{showAmortization ? "▲ Hide Amortization Schedule" : "📊 View Year-wise Breakup"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AMORTIZATION SCHEDULE TABLE (COLLAPSIBLE) */}
      {showAmortization && (
        <div className="amortization-table-container">
          <div className="amortization-header">
            <h3>Yearly Payment Breakdown & Balance</h3>
            <p>See how your loan principal reduces year by year over {tenureYears} years.</p>
          </div>

          <div className="table-responsive">
            <table className="amortization-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Principal Paid (A)</th>
                  <th>Interest Paid (B)</th>
                  <th>Total Paid (A + B)</th>
                  <th>Balance Remaining</th>
                </tr>
              </thead>
              <tbody>
                {amortizationSchedule.map((row) => (
                  <tr key={row.year}>
                    <td><strong>Year {row.year}</strong></td>
                    <td className="text-emerald">₹{formatINR(row.principalPaid)}</td>
                    <td className="text-accent">₹{formatINR(row.interestPaid)}</td>
                    <td>₹{formatINR(row.totalPaid)}</td>
                    <td><strong>₹{formatINR(row.balanceRemaining)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANK OFFERS & COMPARISON SECTION */}
      {showBankList && (
        <div className="bank-partners-section">
          <div className="bank-section-heading">
            <div className="bank-badge">Trusted Banking Partners</div>
            <h3>Compare Top Home Loan Rates in India (2026)</h3>
            <p>
              Compare verified floating and fixed interest rates, processing fees, and perks across leading Indian nationalized and private lenders.
            </p>
          </div>

          <div className="bank-cards-grid">
            {BANK_PARTNERS.map((bank) => {
              const isSelected = selectedBank === bank.id;
              // calculate approximate EMI for this bank's min rate
              const bankR = bank.minRate / 12 / 100;
              const bankN = tenureYears * 12;
              const bankNum = loanAmount * bankR * Math.pow(1 + bankR, bankN);
              const bankDen = Math.pow(1 + bankR, bankN) - 1;
              const bankEmi = Math.round(bankNum / bankDen);

              return (
                <div
                  key={bank.id}
                  className={`bank-card ${isSelected ? "selected-bank" : ""}`}
                >
                  {bank.popular && <span className="popular-badge">⚡ Most Popular</span>}

                  <div className="bank-card-header">
                    <div className="bank-identity">
                      <span className="bank-logo-icon">{bank.logoBadge}</span>
                      <div>
                        <h4 className="bank-name">{bank.name}</h4>
                        <div className="bank-rating">
                          ⭐ {bank.rating} / 5 <span className="bank-tag-pill">{bank.tag}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bank-key-metrics">
                    <div className="bank-metric">
                      <span className="metric-label">Interest Rate</span>
                      <strong className="metric-val text-emerald">
                        {bank.minRate}% - {bank.maxRate}%
                      </strong>
                    </div>

                    <div className="bank-metric">
                      <span className="metric-label">Est. Monthly EMI</span>
                      <strong className="metric-val">₹{formatINR(bankEmi)}</strong>
                    </div>

                    <div className="bank-metric">
                      <span className="metric-label">Processing Fee</span>
                      <span className="metric-sub">{bank.processingFee}</span>
                    </div>

                    <div className="bank-metric">
                      <span className="metric-label">Max Tenure</span>
                      <span className="metric-sub">{bank.maxTenure} Years</span>
                    </div>
                  </div>

                  <p className="bank-highlight">{bank.highlight}</p>

                  <div className="bank-card-actions">
                    <button
                      type="button"
                      className={`btn-use-rate ${isSelected ? "active-rate" : ""}`}
                      onClick={() => handleSelectBank(bank)}
                    >
                      {isSelected ? "✓ Rate Applied" : `Use Rate (${bank.minRate}%)`}
                    </button>

                    <button
                      type="button"
                      className="btn-bank-apply"
                      onClick={() => handleOpenApplyModal(bank)}
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOAN APPLICATION / INQUIRY MODAL */}
      {isApplyModalOpen && (
        <div className="loan-modal-backdrop" onClick={() => setIsApplyModalOpen(false)}>
          <div className="loan-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsApplyModalOpen(false)}
            >
              ✕
            </button>

            {!applySubmitted ? (
              <form className="loan-apply-form" onSubmit={handleApplyFormSubmit}>
                <div className="modal-header">
                  <div className="modal-bank-badge">
                    <span>{applyBank.logoBadge}</span>
                    <span>{applyBank.name} Home Loan</span>
                  </div>
                  <h3>Check Eligibility & Apply for Home Loan</h3>
                  <p>
                    Get instant pre-approval offers with competitive interest rates starting from{" "}
                    <strong>{applyBank.minRate}% p.a.</strong>
                  </p>
                </div>

                {hasPropertyPrice && (
                  <div className="modal-property-ref">
                    <span>📍 Selected Property:</span>
                    <strong>{propertyTitle || "Direct Listing"} (₹{formatINR(propertyVal)})</strong>
                  </div>
                )}

                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={applyFormData.name}
                      onChange={(e) => setApplyFormData({ ...applyFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile number"
                      value={applyFormData.phone}
                      onChange={(e) => setApplyFormData({ ...applyFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={applyFormData.email}
                      onChange={(e) => setApplyFormData({ ...applyFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Current City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Pune, Bengaluru"
                      value={applyFormData.city}
                      onChange={(e) => setApplyFormData({ ...applyFormData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Employment Type</label>
                    <select
                      value={applyFormData.employment}
                      onChange={(e) => setApplyFormData({ ...applyFormData, employment: e.target.value })}
                    >
                      <option value="Salaried">Salaried (Private / Govt)</option>
                      <option value="Self-Employed Business">Self-Employed (Business)</option>
                      <option value="Self-Employed Professional">Self-Employed (Doctor/CA/Lawyer)</option>
                      <option value="NRI">NRI Borrower</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Net In-hand Monthly Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85000"
                      value={applyFormData.monthlyIncome}
                      onChange={(e) => setApplyFormData({ ...applyFormData, monthlyIncome: e.target.value })}
                    />
                  </div>
                </div>

                <div className="loan-summary-callout">
                  <div className="callout-item">
                    <span>Desired Loan:</span>
                    <strong>₹{formatINR(loanAmount)}</strong>
                  </div>
                  <div className="callout-item">
                    <span>Lender:</span>
                    <strong>{applyBank.shortName} ({applyBank.minRate}%)</strong>
                  </div>
                  <div className="callout-item">
                    <span>Est. EMI:</span>
                    <strong className="text-emerald">₹{formatINR(calculation.monthlyEmi)}/mo</strong>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-modal-submit">
                    ✓ Submit & Get Instant Callback
                  </button>
                  <p className="privacy-note">
                    🔒 100% Secure. Your contact details will only be used to process your home loan application.
                  </p>
                </div>
              </form>
            ) : (
              <div className="apply-success-box">
                <div className="success-icon">🎉</div>
                <h3>Home Loan Application Received!</h3>
                <p className="success-message">
                  Thank you, <strong>{applyFormData.name}</strong>. Your loan request has been successfully registered with{" "}
                  <strong>{applyBank.name}</strong>.
                </p>

                <div className="success-id-card">
                  <span className="id-label">Application Reference ID:</span>
                  <strong className="id-val">{applicationId}</strong>
                </div>

                <div className="next-steps-list">
                  <h4>What happens next?</h4>
                  <ul>
                    <li>📞 A dedicated {applyBank.shortName} home loan officer will call you at <strong>+91 {applyFormData.phone}</strong> within 24 business hours.</li>
                    <li>📑 Keep basic KYC documents, 3 months salary slips, and 6 months bank statements ready for digital verification.</li>
                    <li>⚡ Preferential interest rate of <strong>{applyBank.minRate}%</strong> has been locked with your application reference ID.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn-done-modal"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Back to Calculator
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EMICalculator;
