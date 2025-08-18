// 共通エラーメッセージ定数

// 汎用エラーメッセージ
export const COMMON_ERRORS = {
  INVALID_URL: 'Invalid URL format',
  INVALID_TOKEN: 'Token must be 8-16 characters long',
  INVALID_TOKEN_FOR_URL: 'Invalid token for this URL',
  INVALID_ACTION: 'Invalid action',
  ID_REQUIRED: 'id parameter is required',
  NOT_FOUND: 'Not found',
  FAILED_OPERATION: 'Operation failed',
} as const

// Counter エラーメッセージ
export const COUNTER_ERRORS = {
  NOT_FOUND: 'Counter not found',
  INVALID_TYPE: 'Invalid type parameter',
  INVALID_THEME: 'Invalid theme parameter',
  INVALID_FORMAT: 'Invalid format parameter',
  FAILED_TO_INCREMENT: 'Failed to increment counter',
} as const

// Like エラーメッセージ
export const LIKE_ERRORS = {
  NOT_FOUND: 'Like not found',
  INVALID_THEME: 'Invalid theme parameter',
  INVALID_FORMAT: 'Invalid format parameter',
  FAILED_TO_TOGGLE: 'Failed to toggle like',
} as const

// Ranking エラーメッセージ
export const RANKING_ERRORS = {
  NOT_FOUND: 'Ranking not found',
  FAILED_TO_SUBMIT: 'Failed to submit score',
  NAME_NOT_FOUND: 'Name not found',
  INVALID_TOKEN_OR_NOT_FOUND: 'Invalid token, ranking not found, or name not found',
} as const

// BBS エラーメッセージ
export const BBS_ERRORS = {
  NOT_FOUND: 'BBS not found',
  FAILED_TO_POST: 'Failed to post message',
  MESSAGE_NOT_FOUND: 'Message not found',
  NOT_AUTHORIZED: 'Message not found or you are not authorized to remove it',
  NOT_AUTHOR: 'Message not found or you are not the author',
  INVALID_TOKEN_OR_NOT_FOUND: 'Invalid token or BBS not found',
} as const

// パラメータエラーメッセージ
export const PARAM_ERRORS = {
  // Counter
  CREATE_COUNTER_REQUIRED: 'url and token parameters are required for create action',
  INCREMENT_COUNTER_REQUIRED: 'id parameter is required for increment action',
  DISPLAY_COUNTER_REQUIRED: 'id parameter is required for display action',
  SET_COUNTER_REQUIRED: 'url, token, and total parameters are required for set action',
  
  // Like
  CREATE_LIKE_REQUIRED: 'url and token parameters are required for create action',
  TOGGLE_LIKE_REQUIRED: 'url and token parameters are required for toggle action',
  DISPLAY_LIKE_REQUIRED: 'id parameter is required for display action',
  SET_LIKE_REQUIRED: 'url, token, and total parameters are required for set action',
  
  // Ranking
  CREATE_RANKING_REQUIRED: 'url and token parameters are required for create action',
  SUBMIT_RANKING_REQUIRED: 'url, token, and name parameters are required for submit action',
  GET_RANKING_REQUIRED: 'id parameter is required for get action',
  CLEAR_RANKING_REQUIRED: 'url and token parameters are required for clear action',
  REMOVE_RANKING_REQUIRED: 'url, token, and name parameters are required for remove action',
  UPDATE_RANKING_REQUIRED: 'url, token, and name parameters are required for update action',
  
  // BBS
  CREATE_BBS_REQUIRED: 'url and token parameters are required for create action',
  POST_BBS_REQUIRED: 'url, token, and message parameters are required for post action',
  GET_BBS_REQUIRED: 'id parameter is required for get action',
  REMOVE_BBS_REQUIRED: 'url and messageId parameters are required for remove action',
  CLEAR_BBS_REQUIRED: 'url and token parameters are required for clear action',
  UPDATE_BBS_REQUIRED: 'url, messageId, and message parameters are required for update action',
} as const

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  // Counter
  COUNTER_CREATED: 'Counter created successfully',
  COUNTER_INCREMENTED: 'Counter incremented successfully',
  COUNTER_SET: 'Counter value set successfully',
  
  // Like
  LIKE_CREATED: 'Like created successfully',
  LIKE_TOGGLED: 'Like toggled successfully',
  LIKE_SET: 'Like value set successfully',
  
  // Ranking
  RANKING_CREATED: 'Ranking created successfully',
  SCORE_SUBMITTED: 'Score submitted successfully',
  RANKING_CLEARED: (url: string) => `Ranking for ${url} has been cleared`,
  SCORE_REMOVED: (name: string) => `Score for ${name} has been removed`,
  SCORE_UPDATED: (name: string, score: number) => `Score for ${name} has been updated to ${score}`,
  
  // BBS
  BBS_CREATED: 'BBS created successfully',
  MESSAGE_POSTED: 'Message posted successfully',
  MESSAGE_REMOVED: 'Message removed successfully',
  MESSAGE_UPDATED: 'Message updated successfully',
  BBS_CLEARED: (url: string) => `BBS for ${url} has been cleared`,
  
  // 既存データ
  ALREADY_EXISTS: 'Already exists',
  COUNTER_ALREADY_EXISTS: 'Counter already exists',
  LIKE_ALREADY_EXISTS: 'Like already exists',
  RANKING_ALREADY_EXISTS: 'Ranking already exists',
  BBS_ALREADY_EXISTS: 'BBS already exists',
} as const