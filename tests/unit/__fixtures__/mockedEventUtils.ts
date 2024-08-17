import { DragDataEvent } from "../../../src";

export type TestEventType = "MouseEvent" | "TouchEvent";

export function getEventX(event: DragDataEvent, eventType: TestEventType) {
	return eventType === "MouseEvent"
		? (event as MouseEvent).clientX
		: (event as TouchEvent).touches[0].clientX;
}

export function getEventY(event: DragDataEvent, eventType: TestEventType) {
	return eventType === "MouseEvent"
		? (event as MouseEvent).clientY
		: (event as TouchEvent).touches[0].clientY;
}

export function setEventX(
	event: DragDataEvent,
	eventType: TestEventType,
	x: number,
) {
	if (eventType === "MouseEvent") {
		((event as MouseEvent).clientX as number) = x;
	} else {
		((event as TouchEvent).touches[0].clientX as number) = x;
	}
}

export function setEventY(
	event: DragDataEvent,
	eventType: TestEventType,
	y: number,
) {
	if (eventType === "MouseEvent") {
		((event as MouseEvent).clientY as number) = y;
	} else {
		((event as TouchEvent).touches[0].clientY as number) = y;
	}
}
