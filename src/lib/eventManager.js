// eventManager.js

// 이벤트 위임을 위한 전역 이벤트 맵
// 이 맵은 이벤트 타입별로 요소와 해당 요소의 이벤트 핸들러를 저장합니다.
const eventMap = new Map();

// 이벤트 위임이 설정될 루트 요소
let rootElement = null;

// TODO: setupEventListeners 함수 구현
// 이 함수는 루트 요소에 이벤트 위임을 설정합니다.
export function setupEventListeners(root) {
  // 1. rootElement 설정
  rootElement = root;
  // 2. 기존에 설정된 이벤트 리스너 제거 (있다면)
  if (rootElement) {
    eventMap.forEach((_, eventType) => {
      rootElement.removeEventListener(eventType, handleEvent, true);
    });
  }

  // 3. eventMap에 등록된 모든 이벤트 타입에 대해 루트 요소에 이벤트 리스너 추가
  // 주의: 이벤트 캡처링을 사용하여 이벤트를 상위에서 하위로 전파
  eventMap.forEach((_, eventType) => {
    rootElement.addEventListener(eventType, handleEvent, true);
  });
}

// TODO: handleEvent 함수 구현
// 이 함수는 실제 이벤트가 발생했을 때 호출되는 핸들러입니다.
function handleEvent(event) {
  // 1. 이벤트 타겟에서 시작하여 루트 요소까지 버블링
  // 1. 이벤트 타겟에서 시작하여 루트 요소까지 버블링
  let currentElement = event.target;
  const path = [];

  while (currentElement && currentElement !== rootElement) {
    path.push(currentElement);
    currentElement = currentElement.parentElement;
  }

  // 2. 각 요소에 대해 해당 이벤트 타입의 핸들러가 있는지 확인
  // 3. 핸들러가 있다면 실행
  // 이를 통해 하위 요소에서 발생한 이벤트를 상위에서 효율적으로 처리할 수 있습니다.
  const handlers = eventMap.get(event.type);
  if (handlers) {
    for (const element of path) {
      const handler = handlers.get(element);
      if (handler) {
        // 3. 핸들러가 있다면 실행
        handler(event);
        if (event.cancelBubble) {
          break; // 이벤트 버블링을 중단합니다.
        }
      }
    }
  }
}

// TODO: addEvent 함수 구현
export function addEvent(element, eventType, handler) {
  // 1. eventMap에 이벤트 타입과 요소, 핸들러 정보 저장
  // 2. 필요한 경우 루트 요소에 새 이벤트 리스너 추가
  // 이 함수를 통해 개별 요소에 직접 이벤트를 붙이지 않고도 이벤트 처리 가능
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Map());
    if (rootElement) {
      rootElement.addEventListener(eventType, handleEvent, true);
    }
  }
  const handlers = eventMap.get(eventType);
  handlers.set(element, handler);
}

// TODO: removeEvent 함수 구현
export function removeEvent(element, eventType, handler) {
  // 1. eventMap에서 해당 요소와 이벤트 타입에 대한 핸들러 제거
  // 2. 해당 이벤트 타입의 모든 핸들러가 제거되면 루트 요소의 리스너도 제거
  // 이를 통해 더 이상 필요 없는 이벤트 핸들러를 정리하고 메모리 누수 방지

  if (eventMap.has(eventType)) {
    const handlers = eventMap.get(eventType);
    if (handlers.has(element)) {
      // 핸들러 제거
      handlers.delete(element);
      console.log(
        `Removed event handler for ${eventType} on element:`,
        element
      );

      // 해당 이벤트 타입의 모든 핸들러가 제거되면 루트 요소의 리스너도 제거
      if (handlers.size === 0) {
        eventMap.delete(eventType);
        if (rootElement) {
          rootElement.removeEventListener(eventType, handleEvent, true);
          console.log(
            `Removed event listener for ${eventType} from root element.`
          );
        }
      }
    } else {
      console.log(`No handler found for ${eventType} on element:`, element);
    }
  } else {
    console.log(`Event type: ${eventType} not found in eventMap.`);
  }
}
