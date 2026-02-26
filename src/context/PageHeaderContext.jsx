import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const PageHeaderContext = createContext(null);

export const PageHeaderProvider = ({ children }) => {
  const [title, setTitle] = useState("");
  const [hasRefresh, setHasRefresh] = useState(false);
  const [fab, setFab] = useState(null); // { label, icon, onClick } | null

  // Store refresh function in a ref so callers always get the latest version
  // without needing to re-render the Header whenever the fn reference changes.
  const refreshRef = useRef(null);

  // Ref for the scrollable <main> container — FAB attaches scroll listener here.
  const mainRef = useRef(null);

  const setPageMeta = useCallback(
    ({ title: t, onRefresh: r, fab: f } = {}) => {
      if (t !== undefined) setTitle(t);
      if (r !== undefined) {
        refreshRef.current = r || null;
        setHasRefresh(!!r);
      }
      if (f !== undefined) setFab(f || null);
    },
    [],
  );

  // Stable dispatcher — always calls whatever is currently in refreshRef.
  const callRefresh = useCallback(async () => {
    await refreshRef.current?.();
  }, []);

  return (
    <PageHeaderContext.Provider
      value={{ title, hasRefresh, fab, callRefresh, setPageMeta, mainRef }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => useContext(PageHeaderContext);

/**
 * Call this at the top of any page component.
 *
 * @param {string}   title       - Page title shown in the shared header.
 * @param {Function} onRefresh   - Async fn called when the header Refresh button
 *                                 is pressed. Pass null/undefined to hide the button.
 * @param {object}   fab         - { label, icon, onClick } for the mobile FAB.
 *                                 Pass null/undefined for no FAB.
 */
export const usePageMeta = ({ title, onRefresh = null, fab = null } = {}) => {
  const { setPageMeta } = usePageHeader();

  // Update context whenever title or onRefresh reference changes.
  useEffect(() => {
    setPageMeta({ title, onRefresh, fab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, onRefresh]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => setPageMeta({ title: "", onRefresh: null, fab: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
