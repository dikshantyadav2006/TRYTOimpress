import { PageHeader } from "@/components/crud";
import { QuestionForm } from "@/components/question-form";

export default function NewQuestionPage() {
  return (
    <div>
      <PageHeader title="New question" backHref="/questions" />
      <QuestionForm />
    </div>
  );
}
