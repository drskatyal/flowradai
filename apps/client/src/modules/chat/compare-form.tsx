import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export interface CompareFormProps {
  onClose: () => void;
  setDescription: (description: string) => void;
  setSelectedDate: (date: string) => void;
  onSave?: () => void;
  handleOk?: () => void;
  selectedDate?: string;
  description?: string;
}

const CompareFrom: React.FC<CompareFormProps> = ({
  onClose,
  onSave,
  selectedDate,
  setSelectedDate,
  description,
  setDescription,
}) => {
  return (
    <form>
      <div className="max-h-[70vh] lg:max-h-[60vh] h-screen flex flex-col w-full">
        <div className="space-y-2 w-[150px]">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="mt-4 mb-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description for comparison
          </label>
        </div>
        <div className="flex-1 overflow-hidden">
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-full resize-none"
            placeholder="Enter description..."
          />
        </div>
        <div className="flex item-center justify-end flex-wrap w-full gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={!description?.trim()}
            className={`w-full sm:w-auto ${
              !description?.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Ok
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CompareFrom;
