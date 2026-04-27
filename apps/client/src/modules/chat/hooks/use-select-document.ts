
import { useDocuments } from "@/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores";

export const useSelectDocument = () => {
  const {
    selectedDocument,
    setSelectedDocument,
  } = useThreadContext();

  const user = useStore((state) => state.user);
  const { data, isLoading, refetch } = useDocuments();

  const filterData = data?.documents?.filter((document: any) => document.specialityId === user?.specialityId);

  const options = filterData?.map((doc: any) => ({
    value: doc._id,
    label: doc.title,
  }));

  const fetchDocuments = async (query?: string) => {
    if (query) {
      const cleanQuery = query?.replace(/\s+/g, "") || "";
      return options.filter((option: any) =>
        option.label.toLowerCase().includes(cleanQuery.toLowerCase())
      );
    }
    return options;
  };

  const handleDocumentSelect = (value: string) => {
    const doc = data?.documents?.find((option: any) => option._id === value)
    setSelectedDocument(doc);
  };

  return {
    fetchDocuments,
    selectedDocument,
    setSelectedDocument,
    handleDocumentSelect,
  };
};
