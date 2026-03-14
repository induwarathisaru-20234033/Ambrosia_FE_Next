"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "primereact/skeleton";
import { Container } from "react-bootstrap";

const ScrollPanel = dynamic(() =>
  import("primereact/scrollpanel").then((mod) => mod.ScrollPanel),
);

export default function EditEmployeeSkeleton() {
  return (
    <ScrollPanel style={{ width: "100%", height: "100vh" }}>
      <div className="form-container w-full xs:w-2/3 sm:w-1/2 lg:w-2/5 xl:w-1/3 mb-3 mt-4">
        <Skeleton width="12rem" height="2rem" className="mb-4" />
        <Container className="scrollable-container">
          <div className="scrollable-content flex flex-col gap-4">
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="100%" height="3.25rem" />
            <Skeleton width="4rem" height="2rem" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton width="100%" height="3rem" borderRadius="0.75rem" />
            <Skeleton width="100%" height="3rem" borderRadius="0.75rem" />
          </div>
        </Container>
      </div>
    </ScrollPanel>
  );
}
