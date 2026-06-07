import { AnimatedRoadmap } from "@/components/ui/animated-roadmap";
import { Button } from "@/components/ui/button";

const milestonesData: any[] = [
  {
    id: 1,
    name: "Kick-off",
    status: "complete",
    position: { top: "70%", left: "5%" },
  },
  {
    id: 2,
    name: "Design",
    status: "complete",
    position: { top: "15%", left: "20%" },
  },
  {
    id: 3,
    name: "Development",
    status: "in-progress",
    position: { top: "45%", left: "55%" },
  },
  {
    id: 4,
    name: "Launch",
    status: "pending",
    position: { top: "10%", right: "10%" },
  },
];

const HeroSectionDemo = () => {
  return (
    <div className="w-full bg-background text-foreground">
      {/* Container for the Hero Content */}
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Stay ahead with a <span className="bg-primary/20 p-2 rounded-md">clear</span> product plan
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Visualize your roadmap, assign tasks, and hit every milestone—faster and smarter.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg">Get started - it&apos;s free!</Button>
          <Button size="lg" variant="outline">
            See how it works
          </Button>
        </div>
      </div>

      {/* Animated Roadmap Component Demo */}
      <AnimatedRoadmap
        milestones={milestonesData}
        mapImageSrc="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-SsfjxCJh43Hr1dqzkbFWUGH3ICZQbH.png&w=320&q=75"
        aria-label="An animated roadmap showing project milestones from kick-off to launch."
      />
    </div>
  );
};

export default HeroSectionDemo;
