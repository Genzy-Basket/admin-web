import { createContext, useContext, useState, useCallback } from "react";
import { transactionApi } from "../../../api/endpoints/transaction.api";
import { errorBus } from "../../../api/errorBus";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [stats, setStats] = useState(null);

  // Wallet
  const [walletTxns, setWalletTxns] = useState([]);
  const [walletPagination, setWalletPagination] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletFilters, setWalletFilters] = useState({});

  // Payments
  const [payments, setPayments] = useState([]);
  const [paymentPagination, setPaymentPagination] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState({});

  // Subscription payments
  const [subPayments, setSubPayments] = useState([]);
  const [subPaymentPagination, setSubPaymentPagination] = useState(null);
  const [subPaymentLoading, setSubPaymentLoading] = useState(false);
  const [subPaymentFilters, setSubPaymentFilters] = useState({});

  const fetchStats = useCallback(async (force = false) => {
    if (!force && stats) return;
    try {
      const res = await transactionApi.getStats();
      setStats(res.data);
    } catch (err) {
      errorBus.emit(err.message || "Failed to load stats", "error");
    }
  }, [stats]);

  const fetchWallet = useCallback(async (filters = {}, force = false) => {
    if (!force && walletTxns.length > 0 && JSON.stringify(filters) === JSON.stringify(walletFilters)) return;
    setWalletLoading(true);
    setWalletFilters(filters);
    try {
      const res = await transactionApi.getWalletTransactions(filters);
      setWalletTxns(res.transactions || []);
      setWalletPagination(res.pagination || null);
    } catch (err) {
      errorBus.emit(err.message || "Failed to load wallet transactions", "error");
    } finally {
      setWalletLoading(false);
    }
  }, [walletTxns.length, walletFilters]);

  const fetchPayments = useCallback(async (filters = {}, force = false) => {
    if (!force && payments.length > 0 && JSON.stringify(filters) === JSON.stringify(paymentFilters)) return;
    setPaymentLoading(true);
    setPaymentFilters(filters);
    try {
      const res = await transactionApi.getOrderPayments(filters);
      setPayments(res.payments || []);
      setPaymentPagination(res.pagination || null);
    } catch (err) {
      errorBus.emit(err.message || "Failed to load payments", "error");
    } finally {
      setPaymentLoading(false);
    }
  }, [payments.length, paymentFilters]);

  const fetchSubPayments = useCallback(async (filters = {}, force = false) => {
    if (!force && subPayments.length > 0 && JSON.stringify(filters) === JSON.stringify(subPaymentFilters)) return;
    setSubPaymentLoading(true);
    setSubPaymentFilters(filters);
    try {
      const res = await transactionApi.getSubscriptionPayments(filters);
      setSubPayments(res.subscriptions || []);
      setSubPaymentPagination(res.pagination || null);
    } catch (err) {
      errorBus.emit(err.message || "Failed to load subscription payments", "error");
    } finally {
      setSubPaymentLoading(false);
    }
  }, [subPayments.length, subPaymentFilters]);

  return (
    <TransactionContext.Provider
      value={{
        stats,
        walletTxns,
        walletPagination,
        walletLoading,
        walletFilters,
        payments,
        paymentPagination,
        paymentLoading,
        paymentFilters,
        fetchStats,
        fetchWallet,
        fetchPayments,
        subPayments,
        subPaymentPagination,
        subPaymentLoading,
        subPaymentFilters,
        fetchSubPayments,
        setWalletFilters,
        setPaymentFilters,
        setSubPaymentFilters,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
