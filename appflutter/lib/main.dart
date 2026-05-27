// ignore_for_file: use_build_context_synchronously

import 'dart:convert';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:url_launcher/url_launcher.dart';

const String kDefaultApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://192.168.2.220:8000/api',
);

const String kMobilePaymentReturnUrl =
    'recruitmentstudio://employer/billing?status=success';
const String kMobilePaymentCancelUrl =
    'recruitmentstudio://employer/billing?status=cancelled';

const List<String> kEducationOptions = [
  'Không yêu cầu',
  'THPT',
  'Trung cấp',
  'Cao đẳng',
  'Đại học',
  'Sau đại học',
];

const List<String> kLanguageOptions = [
  'Không yêu cầu',
  'Tiếng Anh',
  'Tiếng Nhật',
  'Tiếng Hàn',
  'Tiếng Trung',
  'Tiếng Pháp',
  'Tiếng Đức',
];

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = await ApiConfig.load();
  final session = await AuthSession.load();
  runApp(RecruitmentApp(config: config, session: session));
}

class ApiConfig extends ChangeNotifier {
  ApiConfig(this._baseUrl);

  static const _prefKey = 'api_base_url';
  String _baseUrl;

  String get baseUrl => _baseUrl;

  Uri get baseUri => Uri.parse(_baseUrl);

  String get assetOrigin {
    final uri = baseUri;
    return '${uri.scheme}://${uri.host}${uri.hasPort ? ':${uri.port}' : ''}';
  }

  static Future<ApiConfig> load() async {
    final prefs = await SharedPreferences.getInstance();
    return ApiConfig(
      _normalize(prefs.getString(_prefKey) ?? kDefaultApiBaseUrl),
    );
  }

  factory ApiConfig.inMemory([String url = kDefaultApiBaseUrl]) {
    return ApiConfig(_normalize(url));
  }

  Future<void> setBaseUrl(String value) async {
    _baseUrl = _normalize(value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKey, _baseUrl);
    ApiClient.clearCache();
    notifyListeners();
  }

  String resolveAssetUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final value = url.trim();
    final parsed = Uri.tryParse(value);
    if (parsed == null) return value;
    if (!parsed.hasScheme) {
      final normalizedPath = value.startsWith('/') ? value : '/$value';
      return '$assetOrigin$normalizedPath';
    }
    if (parsed.host == '127.0.0.1' || parsed.host == 'localhost') {
      final base = baseUri;
      return parsed
          .replace(scheme: base.scheme, host: base.host, port: base.port)
          .toString();
    }
    return value;
  }

  static String _normalize(String raw) {
    var value = raw.trim();
    if (value.isEmpty) value = kDefaultApiBaseUrl;
    value = value.replaceAll(RegExp(r'/+$'), '');
    if (!value.endsWith('/api')) value = '$value/api';
    return value;
  }
}

class AuthSession extends ChangeNotifier {
  AuthSession({
    this.role,
    this.candidateToken,
    this.employerToken,
    Map<String, dynamic>? user,
  }) : user = user ?? {};

  static const _roleKey = 'auth_role';
  static const _candidateTokenKey = 'candidate_jwt';
  static const _employerTokenKey = 'employer_jwt';
  static const _userKey = 'auth_user';

  int? role;
  String? candidateToken;
  String? employerToken;
  Map<String, dynamic> user;
  int _candidateJobsVersion = 0;

  bool get isCandidate => role == 1 && candidateToken != null;
  bool get isEmployer => role == 2 && employerToken != null;
  bool get isAuthenticated => isCandidate || isEmployer;

  String? tokenFor(int? requestedRole) {
    final activeRole = requestedRole ?? role;
    if (activeRole == 1) return candidateToken;
    if (activeRole == 2) return employerToken;
    return null;
  }

  Map<String, dynamic> get candidate => user;

  Map<String, dynamic> get employer {
    final nested = user['employer'];
    if (nested is Map) return asMap(nested);
    return user;
  }

  Map<String, dynamic> get employerPermissions => asMap(user['permissions']);

  Map<String, dynamic> get employerMember => asMap(user['member']);

  String get employerRole => textOf(user['role'] ?? employerMember['role']);

  bool canEmployer(String permission) {
    if (!isEmployer) return false;
    if (employerPermissions.isEmpty) return false;
    return boolValue(employerPermissions[permission]);
  }

  int? get currentId {
    if (isEmployer) return intValue(employer['id'] ?? user['id']);
    return intValue(user['id']);
  }

  int get candidateJobsVersion => _candidateJobsVersion;

  void markCandidateJobsChanged() {
    if (!isCandidate) return;
    _candidateJobsVersion++;
    ApiClient.clearCache();
    notifyListeners();
  }

  static Future<AuthSession> load() async {
    final prefs = await SharedPreferences.getInstance();
    final rawUser = prefs.getString(_userKey);
    return AuthSession(
      role: prefs.getInt(_roleKey),
      candidateToken: prefs.getString(_candidateTokenKey),
      employerToken: prefs.getString(_employerTokenKey),
      user: rawUser == null ? {} : asMap(jsonDecode(rawUser)),
    );
  }

  factory AuthSession.empty() => AuthSession();

  Future<void> setLogin({
    required int role,
    required String token,
    required Map<String, dynamic> user,
    bool notify = true,
  }) async {
    this.role = role;
    this.user = user;
    if (role == 1) candidateToken = token;
    if (role == 2) employerToken = token;
    ApiClient.clearCache();
    await _save();
    if (notify) notifyListeners();
  }

  Future<void> updateUser(
    Map<String, dynamic> nextUser, {
    bool forceNotify = false,
  }) async {
    if (!forceNotify && jsonEncode(user) == jsonEncode(nextUser)) {
      return;
    }
    user = nextUser;
    await _save();
    notifyListeners();
  }

  Future<void> clear() async {
    role = null;
    candidateToken = null;
    employerToken = null;
    user = {};
    ApiClient.clearCache();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_roleKey);
    await prefs.remove(_candidateTokenKey);
    await prefs.remove(_employerTokenKey);
    await prefs.remove(_userKey);
    notifyListeners();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    if (role == null) {
      await prefs.remove(_roleKey);
    } else {
      await prefs.setInt(_roleKey, role!);
    }
    if (candidateToken == null) {
      await prefs.remove(_candidateTokenKey);
    } else {
      await prefs.setString(_candidateTokenKey, candidateToken!);
    }
    if (employerToken == null) {
      await prefs.remove(_employerTokenKey);
    } else {
      await prefs.setString(_employerTokenKey, employerToken!);
    }
    await prefs.setString(_userKey, jsonEncode(user));
  }
}

class ApiException implements Exception {
  ApiException(this.message, [this.statusCode]);

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class UploadFile {
  UploadFile({required this.field, required this.name, required this.bytes});

  final String field;
  final String name;
  final Uint8List bytes;
}

class _ApiCacheEntry {
  _ApiCacheEntry(this.value) : createdAt = DateTime.now();

  final dynamic value;
  final DateTime createdAt;

  bool get isFresh =>
      DateTime.now().difference(createdAt) < const Duration(seconds: 45);
}

class ApiClient {
  ApiClient(this.config, this.session);

  final ApiConfig config;
  final AuthSession session;
  static final Map<String, _ApiCacheEntry> _cache = {};

  static void clearCache() => _cache.clear();

  Future<dynamic> get(String path, {Map<String, dynamic>? query, int? role}) =>
      _send('GET', path, query: query, role: role);

  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    int? role,
  }) => _send('POST', path, body: body, query: query, role: role);

  Future<dynamic> patch(String path, {Map<String, dynamic>? body, int? role}) =>
      _send('PATCH', path, body: body, role: role);

  Future<dynamic> delete(String path, {int? role}) =>
      _send('DELETE', path, role: role);

  Future<dynamic> multipart(
    String path, {
    Map<String, dynamic>? fields,
    List<UploadFile> files = const [],
    int? role,
  }) async {
    final request = http.MultipartRequest('POST', _uri(path));
    request.headers.addAll(_headers(role, json: false));
    _addMultipartFields(request.fields, fields ?? {});
    for (final file in files) {
      request.files.add(
        http.MultipartFile.fromBytes(
          file.field,
          file.bytes,
          filename: file.name,
        ),
      );
    }
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final decoded = _handleResponse(response);
    clearCache();
    return decoded;
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    int? role,
  }) async {
    final uri = _uri(path, query: query);
    final headers = _headers(role);
    final encoded = body == null ? null : jsonEncode(body);
    final cacheKey = _cacheKey(method, uri, role);
    if (method == 'GET') {
      final cached = _cache[cacheKey];
      if (cached != null && cached.isFresh) {
        return cached.value;
      }
    }
    final response = switch (method) {
      'GET' => await http.get(uri, headers: headers),
      'POST' => await http.post(uri, headers: headers, body: encoded),
      'PATCH' => await http.patch(uri, headers: headers, body: encoded),
      'DELETE' => await http.delete(uri, headers: headers),
      _ => throw ArgumentError('Unsupported HTTP method $method'),
    };
    final decoded = _handleResponse(response);
    if (method == 'GET') {
      _cache[cacheKey] = _ApiCacheEntry(decoded);
    } else {
      clearCache();
    }
    return decoded;
  }

  String _cacheKey(String method, Uri uri, int? role) {
    final token = session.tokenFor(role) ?? '';
    return '$method|${role ?? session.role ?? 0}|$token|$uri';
  }

  Uri _uri(String path, {Map<String, dynamic>? query}) {
    final base = config.baseUri;
    final normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    final apiRoot = base.path.replaceAll(RegExp(r'/+$'), '');
    final fullPath = '$apiRoot/$normalizedPath';
    final queryString = _buildQuery(query);
    return base.replace(
      path: fullPath,
      query: queryString.isEmpty ? null : queryString,
    );
  }

  Map<String, String> _headers(int? role, {bool json = true}) {
    final headers = <String, String>{'Accept': 'application/json'};
    if (json) headers['Content-Type'] = 'application/json';
    final token = session.tokenFor(role);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  dynamic _handleResponse(http.Response response) {
    final decoded = _decode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    final message = decoded is Map
        ? textOf(
            decoded['message'] ?? decoded['error'],
            'Không thể kết nối máy chủ',
          )
        : textOf(decoded, 'Không thể kết nối máy chủ');
    throw ApiException(message, response.statusCode);
  }

  dynamic _decode(String body) {
    if (body.trim().isEmpty) return null;
    try {
      return jsonDecode(body);
    } catch (_) {
      return body;
    }
  }

  String _buildQuery(Map<String, dynamic>? query) {
    if (query == null || query.isEmpty) return '';
    final parts = <String>[];
    query.forEach((key, value) {
      if (value == null || value == '') return;
      if (value is Iterable) {
        var index = 0;
        for (final item in value) {
          if (item == null || item == '') continue;
          parts.add(
            '${Uri.encodeQueryComponent('$key[$index]')}=${Uri.encodeQueryComponent(_queryValue(item))}',
          );
          index++;
        }
        return;
      }
      parts.add(
        '${Uri.encodeQueryComponent(key)}=${Uri.encodeQueryComponent(_queryValue(value))}',
      );
    });
    return parts.join('&');
  }

  String _queryValue(Object value) {
    if (value is bool) return value ? '1' : '0';
    return value.toString();
  }

  void _addMultipartFields(
    Map<String, String> target,
    Map<String, dynamic> src,
  ) {
    src.forEach((key, value) {
      if (value == null) return;
      if (value is Iterable) {
        var index = 0;
        for (final item in value) {
          if (item == null) continue;
          target['$key[$index]'] = _queryValue(item);
          index++;
        }
      } else {
        target[key] = _queryValue(value);
      }
    });
  }
}

class RecruitmentApi {
  RecruitmentApi(this.client);

  final ApiClient client;

  Future<void> login(
    AuthSession session,
    int role,
    String email,
    String password,
  ) async {
    final res = asMap(
      await client.post(
        '/login',
        body: {'email': email, 'password': password, 'role': role},
      ),
    );
    final token = textOf(asMap(res['authorization'])['token']);
    if (token.isEmpty) throw ApiException('Máy chủ không trả token đăng nhập.');
    await session.setLogin(
      role: role,
      token: token,
      user: asMap(res['user']),
      notify: false,
    );
    try {
      final user = role == 2
          ? await employerMe()
          : asMap(await client.get('/getMe', role: role));
      await session.updateUser(user, forceNotify: true);
    } catch (_) {
      await session.clear();
      rethrow;
    }
  }

  Future<void> logout(AuthSession session) async {
    final activeRole = session.role;
    if (activeRole != null) {
      try {
        await client.get('/logout', role: activeRole);
      } catch (_) {
        // Local logout must still work when the server is not reachable.
      }
    }
    await session.clear();
  }

  Future<dynamic> registerCandidate(Map<String, dynamic> data) =>
      client.post('/register', body: data);

  Future<dynamic> registerEmployer(
    Map<String, dynamic> fields,
    List<UploadFile> documents,
  ) => client.multipart(
    '/employer-registrations',
    fields: fields,
    files: documents
        .map(
          (file) => UploadFile(
            field: 'documents[]',
            name: file.name,
            bytes: file.bytes,
          ),
        )
        .toList(),
  );

  Future<Map<String, dynamic>> requestPasswordOtp(
    String email,
    int role,
  ) async => asMap(
    await client.post('/password/otp', body: {'email': email, 'role': role}),
  );

  Future<void> resetPasswordOtp(
    String email,
    int role,
    String otp,
    String password,
  ) async {
    await client.post(
      '/password/reset',
      body: {'email': email, 'role': role, 'otp': otp, 'password': password},
    );
  }

  Future<List<Map<String, dynamic>>> industries() async =>
      listFromResponse(await client.get('/industries'), key: 'inf');

  Future<List<Map<String, dynamic>>> locations() async =>
      listFromResponse(await client.get('/locations'));

  Future<List<Map<String, dynamic>>> jtypes() async =>
      listFromResponse(await client.get('/jtypes'), key: 'inf');

  Future<List<Map<String, dynamic>>> jlevels() async =>
      listFromResponse(await client.get('/jlevels'), key: 'inf');

  Future<List<Map<String, dynamic>>> jskills() async =>
      listFromResponse(await client.get('/jskills'));

  Future<Map<String, dynamic>> jobs({Map<String, dynamic>? query}) async =>
      asMap(await client.get('/jobs', query: query));

  Future<Map<String, dynamic>> jobDetail(int id) async =>
      asMap(await client.get('/jobs/$id/getByID'));

  Future<List<Map<String, dynamic>>> jobSkills(int id) async =>
      listFromResponse(await client.get('/jobs/$id/getJobSkills'));

  Future<void> applyJob(
    int jobId, {
    UploadFile? cv,
    bool useLatestCv = false,
  }) async {
    if (cv == null && !useLatestCv) {
      throw ApiException(
        'Vui lòng tải lên CV PDF hoặc chọn dùng lại CV đã nộp gần nhất.',
      );
    }
    await client.multipart(
      '/jobs/$jobId/apply',
      role: 1,
      fields: {
        'id': jobId,
        'use_latest_cv': useLatestCv ? 1 : null,
        'fname': cv?.name,
      },
      files: cv == null
          ? const []
          : [UploadFile(field: 'cv', name: cv.name, bytes: cv.bytes)],
    );
  }

  Future<bool> checkApplying(int jobId) async => boolValue(
    asMap(await client.get('/jobs/$jobId/checkApplying', role: 1))['value'],
  );

  Future<bool> checkSaved(int jobId) async => boolValue(
    asMap(
      await client.get('/candidates/$jobId/checkJobSaved', role: 1),
    )['value'],
  );

  Future<void> setSavedJob(int jobId, bool saved) async {
    await client.post(
      '/candidates/$jobId/processJobSaving',
      role: 1,
      body: {'job_id': jobId, 'status': saved},
    );
  }

  Future<Map<String, dynamic>> companies({
    String keyword = '',
    int page = 1,
  }) async => asMap(
    await client.get('/companies', query: {'keyword': keyword, 'page': page}),
  );

  Future<Map<String, dynamic>> companyDetail(int id) async =>
      asMap(await client.get('/companies/$id/getByID'));

  Future<List<Map<String, dynamic>>> companyJobs(int id) async =>
      listFromResponse(await client.get('/companies/$id/getComJobs'));

  Future<Map<String, dynamic>> candidateDashboard() async =>
      asMap(await client.get('/candidates/dashboardSummary', role: 1));

  Future<Map<String, dynamic>> candidateCurrent() async =>
      asMap(await client.get('/candidates/getCurrent', role: 1));

  Future<Map<String, dynamic>> profileBundle() async =>
      asMap(await client.get('/candidates/profileBundle', role: 1));

  Future<void> updateCandidate(
    Map<String, dynamic> fields, {
    UploadFile? image,
  }) async {
    if (image == null) {
      await client.post('/candidates/update', role: 1, body: fields);
      return;
    }
    await client.multipart(
      '/candidates/update',
      role: 1,
      fields: fields,
      files: [UploadFile(field: 'image', name: image.name, bytes: image.bytes)],
    );
  }

  Future<List<Map<String, dynamic>>> candidateAppliedJobs() async =>
      listFromResponse(await client.get('/candidates/appliedJobs', role: 1));

  Future<List<Map<String, dynamic>>> candidateSavedJobs() async =>
      listFromResponse(await client.get('/candidates/savedJobs', role: 1));

  Future<Map<String, dynamic>> nearbyCompanies() async =>
      asMap(await client.get('/candidates/nearbyCompanies', role: 1));

  Future<List<Map<String, dynamic>>> messages(int candidateId) async =>
      listFromResponse(
        await client.get('/cand-msgs/$candidateId/getByCandidateID', role: 1),
      );

  Future<void> markMessageRead(int messageId) async {
    await client.get('/cand-msgs/$messageId/updateReadMsg', role: 1);
  }

  Future<void> sectionCreate(
    String kind,
    Map<String, dynamic> data, {
    UploadFile? image,
  }) async {
    final path = '/$kind';
    if (image != null && (kind == 'certificates' || kind == 'prizes')) {
      await client.multipart(
        path,
        role: 1,
        fields: data,
        files: [
          UploadFile(field: 'image', name: image.name, bytes: image.bytes),
        ],
      );
      return;
    }
    await client.post(path, role: 1, body: data);
  }

  Future<void> sectionUpdate(
    String kind,
    int id,
    Map<String, dynamic> data, {
    UploadFile? image,
  }) async {
    data['id'] = id;
    if (kind == 'educations' || kind == 'certificates' || kind == 'prizes') {
      final path = kind == 'educations'
          ? '/$kind/update/$id'
          : '/$kind/update/$id';
      if (image != null && (kind == 'certificates' || kind == 'prizes')) {
        await client.multipart(
          path,
          role: 1,
          fields: data,
          files: [
            UploadFile(field: 'image', name: image.name, bytes: image.bytes),
          ],
        );
      } else {
        await client.post(path, role: 1, body: data);
      }
      return;
    }
    await client.patch('/$kind/$id', role: 1, body: data);
  }

  Future<void> sectionDelete(String kind, int id) async {
    await client.delete('/$kind/$id', role: 1);
  }

  Future<List<Map<String, dynamic>>> resumes() async => listFromResponse(
    await client.get('/resumes/getByCurrentCandidate', role: 1),
  );

  Future<Map<String, dynamic>> resumeDetail(int id) async =>
      asMap(await client.get('/resumes/$id/getById', role: 1));

  Future<Map<String, dynamic>> employerResumeDetail(int id) async =>
      asMap(await client.get('/resumes/$id/getById', role: 2));

  Future<void> createResume(Map<String, dynamic> data) async {
    await client.post('/resumes', role: 1, body: data);
  }

  Future<void> updateResume(Map<String, dynamic> data) async {
    await client.post('/resumes/update', role: 1, body: data);
  }

  Future<void> deleteResume(int id) async {
    await client.delete('/resumes/$id', role: 1);
  }

  Future<Map<String, dynamic>> employerDashboard() async =>
      asMap(await client.get('/companies/dashboard', role: 2));

  Future<Map<String, dynamic>> employerMe() async =>
      asMap(await client.get('/employer/me', role: 2));

  Future<List<Map<String, dynamic>>> employerBranches() async =>
      listFromResponse(
        await client.get('/employer/branches', role: 2),
        key: 'data',
      );

  Future<Map<String, dynamic>> createBranch(Map<String, dynamic> data) async =>
      asMap(await client.post('/employer/branches', role: 2, body: data));

  Future<Map<String, dynamic>> updateBranch(
    int id,
    Map<String, dynamic> data,
  ) async =>
      asMap(await client.patch('/employer/branches/$id', role: 2, body: data));

  Future<void> deleteBranch(int id) async {
    await client.delete('/employer/branches/$id', role: 2);
  }

  Future<List<Map<String, dynamic>>> employerMembers() async =>
      listFromResponse(
        await client.get('/employer/members', role: 2),
        key: 'data',
      );

  Future<Map<String, dynamic>> createMember(Map<String, dynamic> data) async =>
      asMap(await client.post('/employer/members', role: 2, body: data));

  Future<Map<String, dynamic>> updateMember(
    int id,
    Map<String, dynamic> data,
  ) async =>
      asMap(await client.patch('/employer/members/$id', role: 2, body: data));

  Future<void> lockMember(int id) async {
    await updateMember(id, {'status': 'inactive', 'is_active': false});
  }

  Future<void> deleteMember(int id) async {
    await client.delete('/employer/members/$id', role: 2);
  }

  Future<Map<String, dynamic>> employerBillingSummary() async =>
      asMap(await client.get('/employer/billing/summary', role: 2));

  Future<Map<String, dynamic>> createBillingCheckout(String planKey) async =>
      asMap(
        await client.post(
          '/employer/billing/checkout',
          role: 2,
          body: {
            'plan_key': planKey,
            'source': 'mobile',
            'return_url': kMobilePaymentReturnUrl,
            'cancel_url': kMobilePaymentCancelUrl,
          },
        ),
      );

  Future<Map<String, dynamic>> syncBillingPayment(dynamic orderCode) async =>
      asMap(
        await client.post(
          '/employer/billing/payments/$orderCode/sync',
          role: 2,
        ),
      );

  Future<Map<String, dynamic>> resolveEmployerMapLink(String url) async =>
      asMap(
        await client.post(
          '/companies/resolveSharedMapLink',
          role: 2,
          body: {'url': url},
        ),
      );

  Future<Map<String, dynamic>> resolveCandidateMapLink(String url) async =>
      asMap(
        await client.post(
          '/candidates/resolveSharedMapLink',
          role: 1,
          body: {'url': url},
        ),
      );

  Future<Map<String, dynamic>> updateEmployerProfile(
    Map<String, dynamic> fields, {
    UploadFile? logo,
    UploadFile? image,
  }) async {
    final files = <UploadFile>[];
    if (logo != null) {
      files.add(UploadFile(field: 'logo', name: logo.name, bytes: logo.bytes));
    }
    if (image != null) {
      files.add(
        UploadFile(field: 'image', name: image.name, bytes: image.bytes),
      );
    }
    if (files.isEmpty) {
      return asMap(
        await client.post('/companies/updateCurrent', role: 2, body: fields),
      );
    }
    return asMap(
      await client.multipart(
        '/companies/updateCurrent',
        role: 2,
        fields: fields,
        files: files,
      ),
    );
  }

  Future<List<Map<String, dynamic>>> employerJobs({
    String keyword = '',
  }) async => listFromResponse(
    await client.get('/employer/jobs', role: 2, query: {'keyword': keyword}),
    key: 'data',
  );

  Future<void> createJob(Map<String, dynamic> data) async {
    await client.post('/jobs', role: 2, body: data);
  }

  Future<void> updateJob(int id, Map<String, dynamic> data) async {
    await client.post('/jobs/$id/update', role: 2, body: data);
  }

  Future<void> deleteJob(int id) async {
    await client.delete('/jobs/$id', role: 2);
  }

  Future<void> changeJobStatus(int jobId, bool active) async {
    await client.post(
      '/companies/$jobId/changeJobStatus',
      role: 2,
      body: {'job_id': jobId, 'status': active ? 1 : 0},
    );
  }

  Future<List<Map<String, dynamic>>> applications({
    String keyword = '',
    String status = 'WAITING',
  }) async => listFromResponse(
    await client.get(
      '/companies/getCandidateList',
      role: 2,
      query: {'keyword': keyword, 'status': status},
    ),
    key: 'data',
  );

  Future<Map<String, dynamic>> processApplying(
    Map<String, dynamic> data,
  ) async => asMap(
    await client.post('/companies/processApplying', role: 2, body: data),
  );

  Future<List<Map<String, dynamic>>> searchCandidates(
    Map<String, dynamic> filters,
  ) async => listFromResponse(
    await client.get('/companies/searchCandidates', role: 2, query: filters),
    key: 'data',
  );

  Future<List<Map<String, dynamic>>> talentRecommendations() async =>
      listFromResponse(
        await client.get('/companies/talentRecommendations', role: 2),
      );

  Future<List<Map<String, dynamic>>> recommendedCandidates(int jobId) async =>
      listFromResponse(
        await client.get(
          '/companies/jobs/$jobId/recommendedCandidates',
          role: 2,
        ),
      );

  Future<void> contactCandidate(Map<String, dynamic> data) async {
    await client.post('/companies/contactCandidate', role: 2, body: data);
  }
}

class RecruitmentApp extends StatelessWidget {
  const RecruitmentApp({
    super.key,
    required this.config,
    required this.session,
  });

  final ApiConfig config;
  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([config, session]),
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Recruitment Mobile',
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF0F766E),
            ),
            scaffoldBackgroundColor: const Color(0xFFF7FAF9),
            appBarTheme: const AppBarTheme(
              centerTitle: false,
              backgroundColor: Color(0xFFF7FAF9),
              foregroundColor: Color(0xFF102A27),
              elevation: 0,
            ),
            cardTheme: CardThemeData(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Color(0xFFE1EBE8)),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFFD8E6E2)),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12,
              ),
            ),
            filledButtonTheme: FilledButtonThemeData(
              style: FilledButton.styleFrom(
                minimumSize: const Size(0, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            outlinedButtonTheme: OutlinedButtonThemeData(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            chipTheme: ChipThemeData(
              backgroundColor: const Color(0xFFF3FAF7),
              selectedColor: const Color(0xFF0F766E),
              disabledColor: const Color(0xFFE7EFEC),
              secondarySelectedColor: const Color(0xFF0F766E),
              checkmarkColor: Colors.white,
              side: const BorderSide(color: Color(0xFFBFD5D0)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              labelStyle: const TextStyle(
                color: Color(0xFF173A36),
                fontWeight: FontWeight.w800,
              ),
              secondaryLabelStyle: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
            listTileTheme: const ListTileThemeData(
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              minLeadingWidth: 28,
            ),
          ),
          home: RootShell(config: config, session: session),
        );
      },
    );
  }
}

class RootShell extends StatefulWidget {
  const RootShell({super.key, required this.config, required this.session});

  final ApiConfig config;
  final AuthSession session;

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;
  int? _lastRole;
  String? _pageSignature;
  bool _sideRailOpen = true;
  final PageStorageBucket _pageStorageBucket = PageStorageBucket();
  List<_NavPage> _cachedPages = [];

  RecruitmentApi get api =>
      RecruitmentApi(ApiClient(widget.config, widget.session));

  @override
  void initState() {
    super.initState();
    _hydrateEmployerSession();
  }

  Future<void> _hydrateEmployerSession() async {
    if (!widget.session.isEmployer ||
        widget.session.employerPermissions.isNotEmpty) {
      return;
    }
    try {
      final payload = await api.employerMe();
      await widget.session.updateUser(payload);
      if (mounted) setState(() {});
    } catch (_) {
      // Keep the local session; protected screens will show their API error.
    }
  }

  @override
  void didUpdateWidget(covariant RootShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.session.role != widget.session.role) {
      _index = 0;
      _pageSignature = null;
      _cachedPages = [];
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _hydrateEmployerSession();
      });
    }
  }

  String _signatureForSession() {
    if (widget.session.isCandidate) return 'candidate';
    if (widget.session.isEmployer) {
      final permissions =
          widget.session.employerPermissions.entries
              .where((entry) => boolValue(entry.value))
              .map((entry) => entry.key)
              .toList()
            ..sort();
      return 'employer:${widget.session.employerRole}:${permissions.join(',')}';
    }
    return 'guest';
  }

  List<_NavPage> get _pages {
    final signature = _signatureForSession();
    if (_cachedPages.isEmpty || signature != _pageSignature) {
      _pageSignature = signature;
      _cachedPages = _buildPages();
      if (_index >= _cachedPages.length) _index = 0;
    }
    return _cachedPages;
  }

  List<_NavPage> _buildPages() {
    if (widget.session.isCandidate) {
      return [
        _NavPage(
          'Tổng quan',
          Icons.dashboard_outlined,
          CandidateDashboardScreen(
            api: api,
            session: widget.session,
            config: widget.config,
          ),
        ),
        _NavPage(
          'Việc làm',
          Icons.work_outline,
          JobsScreen(api: api, session: widget.session, config: widget.config),
        ),
        _NavPage(
          'Công ty',
          Icons.business_outlined,
          CompaniesScreen(
            api: api,
            config: widget.config,
            session: widget.session,
          ),
        ),
        _NavPage(
          'Hồ sơ',
          Icons.badge_outlined,
          CandidateProfileScreen(
            api: api,
            session: widget.session,
            config: widget.config,
          ),
        ),
        _NavPage(
          'Công việc',
          Icons.bookmark_border,
          CandidateJobsScreen(
            api: api,
            session: widget.session,
            config: widget.config,
          ),
        ),
        _NavPage(
          'Tin nhắn',
          Icons.notifications_none,
          CandidateMessagesScreen(api: api, session: widget.session),
        ),
      ];
    }
    if (widget.session.isEmployer) {
      final pages = <_NavPage>[
        _NavPage(
          'Tổng quan',
          Icons.dashboard_outlined,
          EmployerDashboardScreen(
            api: api,
            session: widget.session,
            config: widget.config,
          ),
        ),
      ];
      if (widget.session.canEmployer('view_jobs')) {
        pages.add(
          _NavPage(
            'Tin tuyển',
            Icons.post_add_outlined,
            EmployerJobsScreen(api: api, session: widget.session),
          ),
        );
      }
      if (widget.session.canEmployer('view_applications')) {
        pages.add(
          _NavPage(
            'Ứng viên',
            Icons.people_outline,
            EmployerApplicationsScreen(api: api, config: widget.config),
          ),
        );
      }
      if (widget.session.canEmployer('search_candidates')) {
        pages.add(
          _NavPage(
            'Tìm kiếm',
            Icons.manage_search,
            EmployerTalentScreen(
              api: api,
              session: widget.session,
              config: widget.config,
            ),
          ),
        );
      }
      if (widget.session.canEmployer('view_branches')) {
        pages.add(
          _NavPage(
            'Chi nhánh',
            Icons.apartment_outlined,
            EmployerBranchesScreen(api: api, session: widget.session),
          ),
        );
      }
      if (widget.session.canEmployer('view_members')) {
        pages.add(
          _NavPage(
            'Thành viên',
            Icons.group_add_outlined,
            EmployerMembersScreen(api: api, session: widget.session),
          ),
        );
      }
      if (widget.session.canEmployer('manage_billing')) {
        pages.add(
          _NavPage(
            'Thanh toán',
            Icons.credit_card_outlined,
            EmployerBillingScreen(api: api),
          ),
        );
      }
      if (widget.session.canEmployer('manage_company_profile')) {
        pages.add(
          _NavPage(
            'Hồ sơ',
            Icons.business_outlined,
            EmployerProfileScreen(
              api: api,
              session: widget.session,
              config: widget.config,
            ),
          ),
        );
      }
      return pages;
    }
    return [
      _NavPage(
        'Việc làm',
        Icons.work_outline,
        JobsScreen(api: api, session: widget.session, config: widget.config),
      ),
      _NavPage(
        'Công ty',
        Icons.business_outlined,
        CompaniesScreen(
          api: api,
          config: widget.config,
          session: widget.session,
        ),
      ),
      _NavPage(
        'Tài khoản',
        Icons.person_outline,
        AuthScreen(api: api, session: widget.session),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    if (_lastRole != widget.session.role) {
      _lastRole = widget.session.role;
      _index = 0;
      _pageSignature = null;
      _cachedPages = [];
    }
    final pages = _pages;
    if (_index >= pages.length) _index = 0;
    final active = pages[_index];
    final roleLabel = widget.session.isEmployer
        ? memberRoleText(widget.session.employerRole)
        : widget.session.isCandidate
        ? 'Ứng viên'
        : 'Khách';

    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 860;
        return Scaffold(
          drawer: wide
              ? null
              : Drawer(
                  width: 310,
                  child: _AppSideMenu(
                    pages: pages,
                    selectedIndex: _index,
                    session: widget.session,
                    expanded: true,
                    onSelect: (value) {
                      Navigator.pop(context);
                      setState(() => _index = value);
                    },
                    onToggle: null,
                    onLogout: widget.session.isAuthenticated ? _logout : null,
                  ),
                ),
          appBar: AppBar(
            leading: Builder(
              builder: (context) => IconButton(
                tooltip: wide ? 'Ẩn hiện menu' : 'Mở menu',
                onPressed: () {
                  if (wide) {
                    setState(() => _sideRailOpen = !_sideRailOpen);
                  } else {
                    Scaffold.of(context).openDrawer();
                  }
                },
                icon: Icon(
                  wide && _sideRailOpen ? Icons.menu_open : Icons.menu,
                ),
              ),
            ),
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Recruitment Studio',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
                Text(
                  '${active.label} • $roleLabel',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF64748B),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            actions: [
              if (widget.session.isAuthenticated)
                IconButton(
                  tooltip: 'Đăng xuất',
                  onPressed: _logout,
                  icon: const Icon(Icons.logout),
                ),
            ],
          ),
          body: SafeArea(
            child: Row(
              children: [
                if (wide)
                  _AppSideMenu(
                    pages: pages,
                    selectedIndex: _index,
                    session: widget.session,
                    expanded: _sideRailOpen,
                    onSelect: (value) => setState(() => _index = value),
                    onToggle: () =>
                        setState(() => _sideRailOpen = !_sideRailOpen),
                    onLogout: widget.session.isAuthenticated ? _logout : null,
                  ),
                Expanded(
                  child: PageStorage(
                    bucket: _pageStorageBucket,
                    child: IndexedStack(
                      index: _index,
                      children: [for (final page in pages) page.child],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _logout() async {
    await api.logout(widget.session);
    if (mounted) {
      setState(() {
        _index = 0;
        _pageSignature = null;
        _cachedPages = [];
      });
    }
  }
}

class _NavPage {
  _NavPage(this.label, this.icon, this.child);

  final String label;
  final IconData icon;
  final Widget child;
}

class _AppSideMenu extends StatelessWidget {
  const _AppSideMenu({
    required this.pages,
    required this.selectedIndex,
    required this.session,
    required this.expanded,
    required this.onSelect,
    required this.onToggle,
    required this.onLogout,
  });

  final List<_NavPage> pages;
  final int selectedIndex;
  final AuthSession session;
  final bool expanded;
  final ValueChanged<int> onSelect;
  final VoidCallback? onToggle;
  final VoidCallback? onLogout;

  @override
  Widget build(BuildContext context) {
    final width = expanded ? 292.0 : 84.0;
    final name = session.isEmployer
        ? textOf(session.employer['name'], 'Nhà tuyển dụng')
        : session.isCandidate
        ? fullName(session.candidate)
        : 'Khách truy cập';
    final role = session.isEmployer
        ? memberRoleText(session.employerRole)
        : session.isCandidate
        ? 'Ứng viên'
        : 'Khám phá việc làm';

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOutCubic,
      width: width,
      decoration: const BoxDecoration(
        color: Color(0xFF0E2E33),
        border: Border(right: BorderSide(color: Color(0x1AFFFFFF))),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(14, 14, 14, expanded ? 10 : 6),
              child: expanded
                  ? Row(
                      children: [
                        const _WorkspaceMark(),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Recruitment',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                ),
                              ),
                              Text(
                                'Không gian làm việc',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Color(0xFFB6D4CD),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (onToggle != null)
                          IconButton(
                            tooltip: 'Thu gọn menu',
                            onPressed: onToggle,
                            icon: const Icon(
                              Icons.keyboard_double_arrow_left,
                              color: Colors.white,
                            ),
                          ),
                      ],
                    )
                  : Column(
                      children: [
                        const _WorkspaceMark(),
                        if (onToggle != null) ...[
                          const SizedBox(height: 6),
                          IconButton(
                            tooltip: 'Mở rộng menu',
                            onPressed: onToggle,
                            icon: const Icon(
                              Icons.keyboard_double_arrow_right,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ],
                    ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: expanded ? 14 : 10,
                vertical: 6,
              ),
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(expanded ? 12 : 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF143F45),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0x1FFFFFFF)),
                ),
                child: expanded
                    ? Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: const Color(0xFF14B8A6),
                            child: Text(
                              initialsOf(name),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  role,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Color(0xFFB6D4CD),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                    : Tooltip(
                        message: '$name\n$role',
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: const Color(0xFF14B8A6),
                          child: Text(
                            initialsOf(name),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 4),
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.symmetric(
                  horizontal: expanded ? 12 : 10,
                  vertical: 8,
                ),
                itemCount: pages.length,
                separatorBuilder: (context, index) => const SizedBox(height: 4),
                itemBuilder: (context, index) {
                  final page = pages[index];
                  final selected = index == selectedIndex;
                  return Tooltip(
                    message: expanded ? '' : page.label,
                    child: Material(
                      color: selected
                          ? const Color(0xFF0F766E)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () => onSelect(index),
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: expanded ? 12 : 0,
                            vertical: 12,
                          ),
                          child: Row(
                            mainAxisAlignment: expanded
                                ? MainAxisAlignment.start
                                : MainAxisAlignment.center,
                            children: [
                              Icon(
                                page.icon,
                                color: selected
                                    ? Colors.white
                                    : const Color(0xFFB6D4CD),
                              ),
                              if (expanded) ...[
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    page.label,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: selected
                                          ? Colors.white
                                          : const Color(0xFFD7E8E4),
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            if (onLogout != null)
              Padding(
                padding: EdgeInsets.fromLTRB(
                  expanded ? 12 : 10,
                  4,
                  expanded ? 12 : 10,
                  14,
                ),
                child: expanded
                    ? OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0x40FFFFFF)),
                          minimumSize: const Size(0, 46),
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: onLogout,
                        icon: const Icon(Icons.logout),
                        label: const Text(
                          'Đăng xuất',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                      )
                    : Tooltip(
                        message: 'Đăng xuất',
                        child: IconButton.filledTonal(
                          style: IconButton.styleFrom(
                            foregroundColor: Colors.white,
                            backgroundColor: const Color(0xFF143F45),
                          ),
                          onPressed: onLogout,
                          icon: const Icon(Icons.logout),
                        ),
                      ),
              ),
          ],
        ),
      ),
    );
  }
}

class _WorkspaceMark extends StatelessWidget {
  const _WorkspaceMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: const Color(0xFF0F766E),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.work_outline, color: Colors.white),
    );
  }
}

class JobsScreen extends StatefulWidget {
  const JobsScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  final _keyword = TextEditingController();
  final _salary = TextEditingController();
  List<Map<String, dynamic>> _jobs = [];
  List<Map<String, dynamic>> _industries = [];
  List<Map<String, dynamic>> _locations = [];
  List<Map<String, dynamic>> _jtypes = [];
  List<Map<String, dynamic>> _jlevels = [];
  String? _industryId;
  String? _locationId;
  String? _jtypeId;
  String? _jlevelId;
  int _page = 1;
  int _lastPage = 1;
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadBase();
  }

  @override
  void dispose() {
    _keyword.dispose();
    _salary.dispose();
    super.dispose();
  }

  Future<void> _loadBase() async {
    setState(() => _loading = true);
    try {
      final data = await Future.wait([
        widget.api.industries(),
        widget.api.locations(),
        widget.api.jtypes(),
        widget.api.jlevels(),
      ]);
      _industries = data[0];
      _locations = data[1];
      _jtypes = data[2];
      _jlevels = data[3];
      await _loadJobs();
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Map<String, dynamic> _query({int? page}) => {
    'page': page ?? _page,
    'keyword': _keyword.text.trim(),
    'salary': _salary.text.trim(),
    'industry_id': _industryId == null ? null : [_industryId],
    'location_id': _locationId == null ? null : [_locationId],
    'jtype_id': _jtypeId,
    'jlevel_id': _jlevelId,
  };

  Future<void> _loadJobs({int? page}) async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await widget.api.jobs(query: _query(page: page));
      setState(() {
        _page = intValue(res['current_page']) ?? page ?? 1;
        _lastPage = intValue(res['last_page']) ?? 1;
        _jobs = listFromResponse(res, key: 'data');
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadBase,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Cơ hội tuyển dụng',
            title: 'Tìm công việc phù hợp',
            subtitle:
                'Lọc nhanh theo ngành nghề, địa điểm, hình thức và cấp bậc.',
          ),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  TextField(
                    controller: _keyword,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search),
                      labelText: 'Từ khóa',
                    ),
                    onSubmitted: (_) => _loadJobs(page: 1),
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      _simpleDropdown(
                        label: 'Ngành',
                        value: _industryId,
                        items: _industries,
                        onChanged: (value) =>
                            setState(() => _industryId = value),
                      ),
                      _simpleDropdown(
                        label: 'Địa điểm',
                        value: _locationId,
                        items: _locations,
                        onChanged: (value) =>
                            setState(() => _locationId = value),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      _simpleDropdown(
                        label: 'Hình thức',
                        value: _jtypeId,
                        items: _jtypes,
                        onChanged: (value) => setState(() => _jtypeId = value),
                      ),
                      _simpleDropdown(
                        label: 'Cấp bậc',
                        value: _jlevelId,
                        items: _jlevels,
                        onChanged: (value) => setState(() => _jlevelId = value),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    minChildWidth: 160,
                    children: [
                      TextField(
                        controller: _salary,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Lương tối thiểu',
                          suffixText: 'triệu',
                        ),
                      ),
                      FilledButton.icon(
                        onPressed: () => _loadJobs(page: 1),
                        icon: const Icon(Icons.tune),
                        label: const Text('Lọc'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _loadBase)
          else if (_jobs.isEmpty)
            const EmptyState(message: 'Không có việc làm phù hợp.')
          else ...[
            for (final job in _jobs)
              JobCard(
                job: job,
                config: widget.config,
                onTap: () => showJobDetailSheet(
                  context,
                  api: widget.api,
                  session: widget.session,
                  config: widget.config,
                  jobId: intValue(job['id']) ?? 0,
                ),
              ),
            if (_lastPage > 1)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton.filledTonal(
                      onPressed: _page > 1
                          ? () => _loadJobs(page: _page - 1)
                          : null,
                      icon: const Icon(Icons.chevron_left),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Trang $_page / $_lastPage'),
                    ),
                    IconButton.filledTonal(
                      onPressed: _page < _lastPage
                          ? () => _loadJobs(page: _page + 1)
                          : null,
                      icon: const Icon(Icons.chevron_right),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class CompaniesScreen extends StatefulWidget {
  const CompaniesScreen({
    super.key,
    required this.api,
    required this.config,
    required this.session,
  });

  final RecruitmentApi api;
  final ApiConfig config;
  final AuthSession session;

  @override
  State<CompaniesScreen> createState() => _CompaniesScreenState();
}

class _CompaniesScreenState extends State<CompaniesScreen> {
  final _keyword = TextEditingController();
  List<Map<String, dynamic>> _companies = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _keyword.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await widget.api.companies(keyword: _keyword.text.trim());
      setState(() {
        _companies = listFromResponse(res, key: 'data');
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Nhà tuyển dụng',
            title: 'Khám phá công ty',
            subtitle: 'Xem hồ sơ doanh nghiệp và các tin tuyển dụng đang mở.',
          ),
          TextField(
            controller: _keyword,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              labelText: 'Tìm công ty',
            ),
            onSubmitted: (_) => _load(),
          ),
          const SizedBox(height: 14),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_companies.isEmpty)
            const EmptyState(message: 'Không tìm thấy công ty.')
          else
            for (final company in _companies)
              CompanyCard(
                company: company,
                config: widget.config,
                onTap: () => showCompanyDetailSheet(
                  context,
                  widget.api,
                  widget.session,
                  widget.config,
                  intValue(company['id']) ?? 0,
                ),
              ),
        ],
      ),
    );
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.api, required this.session});

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Đăng nhập'),
            Tab(text: 'Ứng viên'),
            Tab(text: 'Nhà tuyển dụng'),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              LoginPane(api: widget.api, session: widget.session),
              CandidateRegisterPane(api: widget.api),
              EmployerRegisterPane(api: widget.api),
            ],
          ),
        ),
      ],
    );
  }
}

class LoginPane extends StatefulWidget {
  const LoginPane({super.key, required this.api, required this.session});

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<LoginPane> createState() => _LoginPaneState();
}

class _LoginPaneState extends State<LoginPane> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  int _role = 1;
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await widget.api.login(
        widget.session,
        _role,
        _email.text.trim(),
        _password.text,
      );
      showSnack(context, 'Đăng nhập thành công.');
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const PageIntro(
          eyebrow: 'Tài khoản',
          title: 'Đăng nhập hệ thống',
          subtitle: 'Chọn đúng vai trò để dùng bộ chức năng tương ứng.',
        ),
        Form(
          key: _formKey,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  SegmentedButton<int>(
                    segments: const [
                      ButtonSegment(
                        value: 1,
                        icon: Icon(Icons.person_outline),
                        label: Text('Ứng viên'),
                      ),
                      ButtonSegment(
                        value: 2,
                        icon: Icon(Icons.business_outlined),
                        label: Text('Nhà tuyển dụng'),
                      ),
                    ],
                    selected: {_role},
                    onSelectionChanged: (value) =>
                        setState(() => _role = value.first),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _password,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Mật khẩu'),
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: _loading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.login),
                      label: const Text('Đăng nhập'),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: _loading
                        ? null
                        : () => showForgotPasswordDialog(
                            context,
                            widget.api,
                            initialRole: _role,
                            initialEmail: _email.text.trim(),
                          ),
                    child: const Text('Quên mật khẩu?'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

Future<void> showForgotPasswordDialog(
  BuildContext context,
  RecruitmentApi api, {
  required int initialRole,
  String initialEmail = '',
}) async {
  final formKey = GlobalKey<FormState>();
  final email = TextEditingController(text: initialEmail);
  final otp = TextEditingController();
  final password = TextEditingController();
  var role = initialRole == 2 ? 2 : 1;
  var otpSent = false;
  var loading = false;

  await showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Đặt lại mật khẩu'),
        content: SizedBox(
          width: 520,
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SegmentedButton<int>(
                    segments: const [
                      ButtonSegment(
                        value: 1,
                        icon: Icon(Icons.person_outline),
                        label: Text('Ứng viên'),
                      ),
                      ButtonSegment(
                        value: 2,
                        icon: Icon(Icons.business_outlined),
                        label: Text('Nhà tuyển dụng'),
                      ),
                    ],
                    selected: {role},
                    onSelectionChanged: loading
                        ? null
                        : (value) => setState(() => role = value.first),
                  ),
                  const SizedBox(height: 12),
                  textField(
                    email,
                    'Email đăng nhập',
                    keyboardType: TextInputType.emailAddress,
                    validator: requiredValidator,
                  ),
                  if (otpSent) ...[
                    const SizedBox(height: 10),
                    textField(
                      otp,
                      'Mã OTP',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.trim().length != 6) {
                          return 'Nhập mã OTP 6 số';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 10),
                    textField(
                      password,
                      'Mật khẩu mới',
                      obscureText: true,
                      validator: (value) {
                        if (value == null || value.length < 6) {
                          return 'Mật khẩu tối thiểu 6 ký tự';
                        }
                        return null;
                      },
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: loading ? null : () => popDialogSafely<void>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: loading
                ? null
                : () async {
                    if (!formKey.currentState!.validate()) return;
                    setState(() => loading = true);
                    try {
                      if (!otpSent) {
                        final response = await api.requestPasswordOtp(
                          email.text.trim(),
                          role,
                        );
                        final debugOtp = textOf(response['debug_otp']);
                        if (debugOtp.isNotEmpty) {
                          otp.text = debugOtp;
                        }
                        showSnack(
                          context,
                          debugOtp.isEmpty
                              ? 'Đã gửi OTP về email.'
                              : 'Đã tạo OTP. Môi trường local đã tự điền mã.',
                        );
                        setState(() {
                          otpSent = true;
                          loading = false;
                        });
                        return;
                      }
                      await api.resetPasswordOtp(
                        email.text.trim(),
                        role,
                        otp.text.trim(),
                        password.text,
                      );
                      showSnack(context, 'Đã đặt lại mật khẩu.');
                      await popDialogSafely<void>(context);
                    } catch (error) {
                      showSnack(context, error.toString(), isError: true);
                      setState(() => loading = false);
                    }
                  },
            child: Text(
              loading
                  ? 'Đang xử lý...'
                  : otpSent
                  ? 'Đổi mật khẩu'
                  : 'Gửi OTP',
            ),
          ),
        ],
      ),
    ),
  );

  email.dispose();
  otp.dispose();
  password.dispose();
}

class CandidateRegisterPane extends StatefulWidget {
  const CandidateRegisterPane({super.key, required this.api});

  final RecruitmentApi api;

  @override
  State<CandidateRegisterPane> createState() => _CandidateRegisterPaneState();
}

class _CandidateRegisterPaneState extends State<CandidateRegisterPane> {
  final _formKey = GlobalKey<FormState>();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  List<Map<String, dynamic>> _skills = [];
  final Set<int> _selectedSkills = {};
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    widget.api.jskills().then((value) {
      if (mounted) setState(() => _skills = value);
    });
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await widget.api.registerCandidate({
        'firstname': _first.text.trim(),
        'lastname': _last.text.trim(),
        'email': _email.text.trim(),
        'password': _password.text,
        'skills': _selectedSkills.toList(),
      });
      showSnack(context, 'Đã tạo tài khoản ứng viên. Bạn có thể đăng nhập.');
      _formKey.currentState!.reset();
      _selectedSkills.clear();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const PageIntro(
          eyebrow: 'Ứng viên',
          title: 'Tạo tài khoản ứng viên',
          subtitle: 'Hồ sơ cá nhân sẽ được tạo cùng tài khoản đăng nhập.',
        ),
        Form(
          key: _formKey,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveFormRow(
                    children: [
                      textField(_last, 'Họ', validator: requiredValidator),
                      textField(_first, 'Tên', validator: requiredValidator),
                    ],
                  ),
                  const SizedBox(height: 10),
                  textField(
                    _email,
                    'Email',
                    keyboardType: TextInputType.emailAddress,
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  textField(
                    _password,
                    'Mật khẩu',
                    obscureText: true,
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Kỹ năng quan tâm',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final skill in _skills.take(24))
                        Builder(
                          builder: (context) {
                            final id = intValue(skill['id']);
                            final selected =
                                id != null && _selectedSkills.contains(id);
                            return FilterChip(
                              label: Text(textOf(skill['name'])),
                              selected: selected,
                              backgroundColor: const Color(0xFFF5FBF8),
                              selectedColor: const Color(0xFF0F766E),
                              checkmarkColor: Colors.white,
                              side: BorderSide(
                                color: selected
                                    ? const Color(0xFF0F766E)
                                    : const Color(0xFFBFD5D0),
                              ),
                              labelStyle: TextStyle(
                                color: selected
                                    ? Colors.white
                                    : const Color(0xFF173A36),
                                fontWeight: FontWeight.w800,
                              ),
                              onSelected: (value) {
                                if (id == null) return;
                                setState(() {
                                  value
                                      ? _selectedSkills.add(id)
                                      : _selectedSkills.remove(id);
                                });
                              },
                            );
                          },
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: const Icon(Icons.person_add_alt),
                      label: const Text('Đăng ký ứng viên'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class EmployerRegisterPane extends StatefulWidget {
  const EmployerRegisterPane({super.key, required this.api});

  final RecruitmentApi api;

  @override
  State<EmployerRegisterPane> createState() => _EmployerRegisterPaneState();
}

class _EmployerRegisterPaneState extends State<EmployerRegisterPane> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _company = TextEditingController();
  final _address = TextEditingController();
  final _contact = TextEditingController();
  final _phone = TextEditingController();
  final _website = TextEditingController();
  final _minEmployees = TextEditingController();
  final _maxEmployees = TextEditingController();
  final _description = TextEditingController();
  List<UploadFile> _documents = [];
  bool _loading = false;

  @override
  void dispose() {
    for (final controller in [
      _email,
      _company,
      _address,
      _contact,
      _phone,
      _website,
      _minEmployees,
      _maxEmployees,
      _description,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _pickDocuments() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      withData: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
    );
    if (result == null) return;
    setState(() {
      _documents = result.files
          .where((file) => file.bytes != null)
          .map(
            (file) => UploadFile(
              field: 'documents[]',
              name: file.name,
              bytes: file.bytes!,
            ),
          )
          .take(5)
          .toList();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_documents.isEmpty) {
      showSnack(
        context,
        'Cần chọn ít nhất một tài liệu xác minh.',
        isError: true,
      );
      return;
    }
    setState(() => _loading = true);
    try {
      await widget.api.registerEmployer({
        'email': _email.text.trim(),
        'company_name': _company.text.trim(),
        'address': _address.text.trim(),
        'contact_name': _contact.text.trim(),
        'phone': _phone.text.trim(),
        'website': _website.text.trim(),
        'min_employees': _minEmployees.text.trim(),
        'max_employees': _maxEmployees.text.trim(),
        'description': _description.text.trim(),
      }, _documents);
      showSnack(
        context,
        'Đã gửi yêu cầu đăng ký. Tài khoản sẽ dùng được sau khi admin duyệt.',
      );
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const PageIntro(
          eyebrow: 'Nhà tuyển dụng',
          title: 'Gửi yêu cầu mở tài khoản',
          subtitle:
              'Hồ sơ doanh nghiệp cần tài liệu xác minh để admin phê duyệt.',
        ),
        Form(
          key: _formKey,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  textField(
                    _email,
                    'Email đăng nhập',
                    keyboardType: TextInputType.emailAddress,
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  textField(
                    _company,
                    'Tên công ty',
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  textField(_address, 'Địa chỉ', validator: requiredValidator),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      textField(_contact, 'Người liên hệ'),
                      textField(
                        _phone,
                        'Điện thoại',
                        keyboardType: TextInputType.phone,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  textField(_website, 'Website'),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      textField(
                        _minEmployees,
                        'Nhân sự từ',
                        keyboardType: TextInputType.number,
                      ),
                      textField(
                        _maxEmployees,
                        'Đến',
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  textField(_description, 'Mô tả công ty', maxLines: 4),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _pickDocuments,
                    icon: const Icon(Icons.attach_file),
                    label: Text(
                      _documents.isEmpty
                          ? 'Chọn tài liệu xác minh'
                          : '${_documents.length} tài liệu đã chọn',
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: const Icon(Icons.send_outlined),
                      label: const Text('Gửi đăng ký'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class CandidateDashboardScreen extends StatefulWidget {
  const CandidateDashboardScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<CandidateDashboardScreen> createState() =>
      _CandidateDashboardScreenState();
}

class _CandidateDashboardScreenState extends State<CandidateDashboardScreen> {
  Map<String, dynamic> _summary = {};
  Map<String, dynamic> _nearby = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final results = await Future.wait([
        widget.api.candidateDashboard(),
        widget.api.nearbyCompanies(),
      ]);
      setState(() {
        _summary = results[0];
        _nearby = results[1];
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final sectionCounts = asMap(_summary['section_counts']);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: 'Ứng viên',
            title: 'Xin chào ${fullName(widget.session.candidate)}',
            subtitle: 'Theo dõi hồ sơ, việc đã ứng tuyển và công ty gần bạn.',
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else ...[
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
              childAspectRatio: 1.35,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                MetricCard(
                  label: 'Đã ứng tuyển',
                  value: textOf(_summary['applied_jobs_count'], '0'),
                  icon: Icons.outbox_outlined,
                ),
                MetricCard(
                  label: 'Đã lưu',
                  value: textOf(_summary['saved_jobs_count'], '0'),
                  icon: Icons.bookmark_border,
                ),
                MetricCard(
                  label: 'Mục hồ sơ',
                  value:
                      '${sectionCounts.values.fold<int>(0, (sum, value) => sum + (intValue(value) ?? 0))}',
                  icon: Icons.fact_check_outlined,
                ),
              ],
            ),
            const SizedBox(height: 14),
            SectionHeader(
              title: 'Độ đầy đủ hồ sơ',
              subtitle: 'Các mục dữ liệu lấy từ profileBundle.',
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final entry in sectionCounts.entries)
                  Chip(
                    label: Text(
                      '${profileSectionLabel(entry.key)}: ${entry.value}',
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            SectionHeader(
              title: 'Công ty gần bạn',
              subtitle: boolValue(_nearby['has_location'])
                  ? 'Trong bán kính ${textOf(_nearby['distance_limit_km'], '10')} km'
                  : 'Cập nhật tọa độ trong hồ sơ để xem gợi ý theo vị trí.',
            ),
            for (final company in listFromResponse(_nearby, key: 'data'))
              CompanyCard(
                company: company,
                config: widget.config,
                trailing: textOf(company['distance_km']).isEmpty
                    ? null
                    : '${company['distance_km']} km',
                onTap: () => showCompanyDetailSheet(
                  context,
                  widget.api,
                  widget.session,
                  widget.config,
                  intValue(company['id']) ?? 0,
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class CandidateProfileScreen extends StatefulWidget {
  const CandidateProfileScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<CandidateProfileScreen> createState() => _CandidateProfileScreenState();
}

class _CandidateProfileScreenState extends State<CandidateProfileScreen> {
  Map<String, dynamic> _bundle = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final bundle = await widget.api.profileBundle();
      setState(() {
        _bundle = bundle;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _editPersonal() async {
    final personal = asMap(_bundle['personal']);
    final result = await showCandidatePersonalDialog(
      context,
      widget.api,
      widget.config,
      personal,
    );
    if (result == null) return;
    try {
      await widget.api.updateCandidate(result.fields, image: result.image);
      final fresh = await widget.api.candidateCurrent();
      await widget.session.updateUser({...widget.session.user, ...fresh});
      showSnack(context, 'Đã cập nhật hồ sơ cá nhân.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _editSkills() async {
    try {
      final allSkills = await widget.api.jskills();
      final currentSkills = listFromResponse(_bundle, key: 'skills');
      final selectedNames = await showCandidateSkillPickerDialog(
        context,
        allSkills,
        currentSkills,
      );
      if (selectedNames == null) return;

      for (final skill in currentSkills) {
        final id = intValue(skill['id']);
        if (id != null) {
          await widget.api.sectionDelete('skills', id);
        }
      }
      for (final name in selectedNames) {
        await widget.api.sectionCreate('skills', {'name': name});
      }
      showSnack(context, 'Đã cập nhật kỹ năng.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _upsertSection(
    ProfileSection section, [
    Map<String, dynamic>? item,
  ]) async {
    if (section.key == 'skills') {
      await _editSkills();
      return;
    }
    final result = await showSectionDialog(context, section, item);
    if (result == null) return;
    if (section.key == 'projects') {
      result.fields.addAll({
        'name': '',
        'prj_type': '',
        'role': '',
        'technologies': '',
        'start_date': '',
        'end_date': '',
        'description': '',
      });
    }
    try {
      if (item == null) {
        await widget.api.sectionCreate(
          section.key,
          result.fields,
          image: result.image,
        );
      } else {
        await widget.api.sectionUpdate(
          section.key,
          intValue(item['id'])!,
          result.fields,
          image: result.image,
        );
      }
      showSnack(context, 'Đã lưu ${section.label.toLowerCase()}.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _deleteSection(
    ProfileSection section,
    Map<String, dynamic> item,
  ) async {
    final ok = await confirmDialog(
      context,
      'Xóa ${section.label.toLowerCase()}?',
    );
    if (!ok) return;
    try {
      await widget.api.sectionDelete(section.key, intValue(item['id'])!);
      showSnack(context, 'Đã xóa.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final personal = asMap(_bundle['personal']);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Hồ sơ',
            title: 'Quản lý hồ sơ ứng viên',
            subtitle:
                'Cập nhật thông tin cá nhân và các mục năng lực. Khi ứng tuyển, hệ thống chỉ nhận CV PDF.',
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AppAvatar(
                          url: widget.config.resolveAssetUrl(
                            textOf(personal['avatar']),
                          ),
                          label: fullName(personal),
                          radius: 34,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                fullName(personal),
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(fontWeight: FontWeight.w800),
                              ),
                              Text(textOf(personal['email'], 'Chưa có email')),
                              Text(
                                textOf(personal['phone'], 'Chưa có điện thoại'),
                              ),
                            ],
                          ),
                        ),
                        IconButton.filledTonal(
                          onPressed: _editPersonal,
                          icon: const Icon(Icons.edit_outlined),
                        ),
                      ],
                    ),
                    if (textOf(personal['objective']).isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(textOf(personal['objective'])),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            for (final section in profileSections)
              ProfileSectionPanel(
                section: section,
                items: listFromResponse(_bundle, key: section.key),
                onAdd: () => _upsertSection(section),
                onEdit: (item) => _upsertSection(section, item),
                onDelete: (item) => _deleteSection(section, item),
              ),
          ],
        ],
      ),
    );
  }
}

class CandidateJobsScreen extends StatefulWidget {
  const CandidateJobsScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<CandidateJobsScreen> createState() => _CandidateJobsScreenState();
}

class _CandidateJobsScreenState extends State<CandidateJobsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  List<Map<String, dynamic>> _applied = [];
  List<Map<String, dynamic>> _saved = [];
  bool _loading = true;
  String _error = '';
  late int _seenCandidateJobsVersion;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _seenCandidateJobsVersion = widget.session.candidateJobsVersion;
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!widget.session.isCandidate) return;
    _seenCandidateJobsVersion = widget.session.candidateJobsVersion;
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final results = await Future.wait([
        widget.api.candidateAppliedJobs(),
        widget.api.candidateSavedJobs(),
      ]);
      setState(() {
        _applied = results[0];
        _saved = results[1];
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_seenCandidateJobsVersion != widget.session.candidateJobsVersion) {
      _seenCandidateJobsVersion = widget.session.candidateJobsVersion;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _load();
      });
    }

    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 6, 16, 8),
          child: PageIntro(
            eyebrow: 'Công việc',
            title: 'Theo dõi ứng tuyển',
            subtitle: 'Quản lý việc đã ứng tuyển và danh sách đã lưu.',
          ),
        ),
        TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Đã ứng tuyển'),
            Tab(text: 'Đã lưu'),
          ],
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: _loading
                ? const LoadingList()
                : _error.isNotEmpty
                ? ListView(
                    padding: const EdgeInsets.all(16),
                    children: [ErrorPanel(message: _error, onRetry: _load)],
                  )
                : TabBarView(
                    controller: _tabs,
                    children: [
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          if (_applied.isEmpty)
                            const EmptyState(
                              message: 'Chưa ứng tuyển công việc nào.',
                            )
                          else
                            for (final item in _applied)
                              Card(
                                child: ListTile(
                                  leading: statusIcon(textOf(item['status'])),
                                  title: Text(textOf(item['jname'])),
                                  subtitle: Text(
                                    '${textOf(item['name'])}\n${applicationStatusText(textOf(item['status']))} - ${textOf(item['postDate'])}',
                                  ),
                                  isThreeLine: true,
                                  trailing:
                                      textOf(item['cv_link']).isEmpty &&
                                          intValue(item['resume_id']) == null
                                      ? null
                                      : IconButton(
                                          tooltip: 'Mở CV đã nộp',
                                          icon: const Icon(Icons.open_in_new),
                                          onPressed: () async {
                                            final cvLink = textOf(
                                              item['cv_link'],
                                            );
                                            if (cvLink.isNotEmpty) {
                                              await openPdfViewer(
                                                context,
                                                widget.config,
                                                cvLink,
                                                title: 'CV đã nộp',
                                              );
                                              return;
                                            }
                                            final resumeId = intValue(
                                              item['resume_id'],
                                            );
                                            if (resumeId == null) return;
                                            final detail = await widget.api
                                                .resumeDetail(resumeId);
                                            if (!context.mounted) return;
                                            showResumeSheet(context, detail);
                                          },
                                        ),
                                  onTap: () {
                                    final jobId = intValue(item['id']) ?? 0;
                                    if (jobId == 0) return;
                                    showJobDetailSheet(
                                      context,
                                      api: widget.api,
                                      session: widget.session,
                                      config: widget.config,
                                      jobId: jobId,
                                    );
                                  },
                                ),
                              ),
                        ],
                      ),
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          if (_saved.isEmpty)
                            const EmptyState(message: 'Chưa lưu công việc nào.')
                          else
                            for (final job in _saved)
                              JobCard(
                                job: job,
                                config: widget.config,
                                onTap: () => showJobDetailSheet(
                                  context,
                                  api: widget.api,
                                  session: widget.session,
                                  config: widget.config,
                                  jobId: intValue(job['id']) ?? 0,
                                ),
                              ),
                        ],
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}

class CandidateMessagesScreen extends StatefulWidget {
  const CandidateMessagesScreen({
    super.key,
    required this.api,
    required this.session,
  });

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<CandidateMessagesScreen> createState() =>
      _CandidateMessagesScreenState();
}

class _CandidateMessagesScreenState extends State<CandidateMessagesScreen> {
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final id = widget.session.currentId;
    if (id == null) return;
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final messages = await widget.api.messages(id);
      setState(() {
        _messages = messages.reversed.toList();
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _open(Map<String, dynamic> message) async {
    final id = intValue(message['id']);
    if (id != null && !boolValue(message['isRead'])) {
      await widget.api.markMessageRead(id);
    }
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(textOf(message['title'])),
        content: SingleChildScrollView(child: Text(textOf(message['content']))),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<void>(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Thông báo',
            title: 'Tin nhắn từ nhà tuyển dụng',
            subtitle:
                'Các phản hồi hồ sơ và lời mời liên hệ sẽ xuất hiện tại đây.',
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_messages.isEmpty)
            const EmptyState(message: 'Chưa có tin nhắn.')
          else
            for (final message in _messages)
              Card(
                child: ListTile(
                  leading: Icon(
                    boolValue(message['isRead'])
                        ? Icons.mark_email_read_outlined
                        : Icons.mark_email_unread_outlined,
                  ),
                  title: Text(
                    textOf(message['title']),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    textOf(message['name']),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(message),
                ),
              ),
        ],
      ),
    );
  }
}

class EmployerDashboardScreen extends StatefulWidget {
  const EmployerDashboardScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<EmployerDashboardScreen> createState() =>
      _EmployerDashboardScreenState();
}

class _EmployerDashboardScreenState extends State<EmployerDashboardScreen> {
  Map<String, dynamic> _data = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final data = await widget.api.employerDashboard();
      await widget.session.updateUser({
        ...widget.session.user,
        ...data,
        'employer': asMap(data['employer']),
      });
      setState(() {
        _data = data;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final stats = asMap(_data['stats']);
    final employer = asMap(_data['employer']);
    final workspace = asMap(_data['workspace_location']).isEmpty
        ? employer
        : asMap(_data['workspace_location']);
    final branchStats = asMap(_data['branch_stats']);
    final branchSummaries = listFromResponse(_data, key: 'branch_summaries');
    final isCompanyScope = textOf(_data['profile_scope']) == 'company';
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: isCompanyScope ? 'Tổng công ty' : 'Chi nhánh',
            title: textOf(employer['name'], 'Bảng điều khiển'),
            subtitle: isCompanyScope
                ? 'Quản lý hiệu suất tuyển dụng của toàn bộ chi nhánh trong công ty.'
                : 'Không gian làm việc: ${textOf(workspace['name'], 'Chi nhánh được phân quyền')}.',
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.place_outlined),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                textOf(
                                  workspace['name'],
                                  textOf(employer['name']),
                                ),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(
                                textOf(
                                  workspace['address'],
                                  'Chưa cập nhật địa chỉ',
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Chip(
                      label: Text(
                        memberRoleText(
                          textOf(widget.session.employerRole, 'employer'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
              childAspectRatio: 1.35,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                MetricCard(
                  label: 'Tổng tin',
                  value: textOf(stats['total_jobs'], '0'),
                  icon: Icons.work_outline,
                ),
                MetricCard(
                  label: 'Đang mở',
                  value: textOf(stats['active_jobs'], '0'),
                  icon: Icons.toggle_on_outlined,
                ),
                MetricCard(
                  label: 'Hồ sơ',
                  value: textOf(stats['total_applications'], '0'),
                  icon: Icons.people_outline,
                ),
                MetricCard(
                  label: 'Phỏng vấn',
                  value: textOf(stats['interviewing_applications'], '0'),
                  icon: Icons.event_available_outlined,
                ),
              ],
            ),
            if (isCompanyScope && branchSummaries.isNotEmpty) ...[
              const SizedBox(height: 14),
              SectionHeader(
                title: 'Tổng quan chi nhánh',
                subtitle:
                    '${textOf(branchStats['active'], '0')} chi nhánh hoạt động, ${textOf(branchStats['total_members'], '0')} nhân sự HR.',
              ),
              for (final branch in branchSummaries.take(5))
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              boolValue(branch['is_headquarters'])
                                  ? Icons.domain_outlined
                                  : Icons.apartment_outlined,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    textOf(branch['name']),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Text(
                                    '${textOf(branch['active_jobs'], '0')} tin mở • ${textOf(branch['waiting_applications'], '0')} hồ sơ chờ • ${textOf(branch['total_members'], '0')} HR',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Chip(
                          label: Text(
                            boolValue(branch['is_active'])
                                ? 'Hoạt động'
                                : 'Tạm khóa',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
            const SizedBox(height: 14),
            SectionHeader(title: 'Trạng thái hồ sơ'),
            for (final item in listFromResponse(
              _data,
              key: 'application_status',
            ))
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: LinearProgressIndicator(
                  value:
                      (intValue(item['value']) ?? 0) /
                      ((intValue(stats['total_applications']) ?? 1).clamp(
                        1,
                        999999,
                      )),
                  minHeight: 10,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            const SizedBox(height: 12),
            SectionHeader(title: 'Tin tuyển dụng hiệu quả'),
            for (final job in listFromResponse(_data, key: 'job_performance'))
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.trending_up),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  textOf(job['jname']),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                Text(
                                  'Ứng tuyển: ${textOf(job['total_applications'], '0')}',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Chip(
                        label: Text(
                          boolValue(job['is_active']) ? 'Đang mở' : 'Đã tắt',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class EmployerProfileScreen extends StatefulWidget {
  const EmployerProfileScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<EmployerProfileScreen> createState() => _EmployerProfileScreenState();
}

class _EmployerProfileScreenState extends State<EmployerProfileScreen> {
  Map<String, dynamic> _employer = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final data = await widget.api.employerDashboard();
      setState(() {
        _employer = asMap(data['employer']);
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _edit() async {
    final result = await showEmployerProfileDialog(
      context,
      widget.api,
      widget.config,
      _employer,
    );
    if (result == null) return;
    try {
      final employer = await widget.api.updateEmployerProfile(
        result.fields,
        logo: result.logo,
        image: result.image,
      );
      await widget.session.updateUser({
        ...widget.session.user,
        'employer': employer,
      });
      showSnack(context, 'Đã cập nhật công ty.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Doanh nghiệp',
            title: 'Hồ sơ nhà tuyển dụng',
            subtitle: 'Cập nhật thông tin hiển thị với ứng viên.',
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (textOf(_employer['image']).isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.config.resolveAssetUrl(
                            textOf(_employer['image']),
                          ),
                          height: 150,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const SizedBox(height: 0),
                        ),
                      ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        AppAvatar(
                          url: widget.config.resolveAssetUrl(
                            textOf(_employer['logo']),
                          ),
                          label: textOf(_employer['name']),
                          radius: 34,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                textOf(_employer['name']),
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(fontWeight: FontWeight.w800),
                              ),
                              Text(
                                textOf(_employer['address'], 'Chưa có địa chỉ'),
                              ),
                              Text(
                                textOf(_employer['website'], 'Chưa có website'),
                              ),
                            ],
                          ),
                        ),
                        IconButton.filledTonal(
                          onPressed: _edit,
                          icon: const Icon(Icons.edit_outlined),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      textOf(
                        _employer['description'],
                        'Chưa có mô tả công ty.',
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        InfoPill(
                          icon: Icons.person_outline,
                          text:
                              'Liên hệ: ${textOf(_employer['contact_name'], 'Chưa có')}',
                        ),
                        InfoPill(
                          icon: Icons.call_outlined,
                          text: 'SĐT: ${textOf(_employer['phone'], 'Chưa có')}',
                        ),
                        InfoPill(
                          icon: Icons.groups_outlined,
                          text: 'Quy mô: ${employeeRange(_employer)}',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class EmployerBranchesScreen extends StatefulWidget {
  const EmployerBranchesScreen({
    super.key,
    required this.api,
    required this.session,
  });

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<EmployerBranchesScreen> createState() => _EmployerBranchesScreenState();
}

class _EmployerBranchesScreenState extends State<EmployerBranchesScreen> {
  List<Map<String, dynamic>> _branches = [];
  Map<String, dynamic> _permissions = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final payload = await widget.api.employerMe();
      await widget.session.updateUser({...widget.session.user, ...payload});
      setState(() {
        _branches = listFromResponse(payload, key: 'branches');
        _permissions = asMap(payload['permissions']);
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _upsert([Map<String, dynamic>? branch]) async {
    final canCreate = boolValue(_permissions['create_branches']);
    final canUpdate =
        boolValue(_permissions['update_branches']) ||
        boolValue(_permissions['update_own_branch']);
    if (branch == null && !canCreate) return;
    if (branch != null && !canUpdate) return;

    final result = await showBranchDialog(context, widget.api, branch);
    if (result == null) return;
    try {
      if (branch == null) {
        await widget.api.createBranch(result);
        showSnack(context, 'Đã tạo chi nhánh.');
      } else {
        await widget.api.updateBranch(intValue(branch['id'])!, result);
        showSnack(context, 'Đã cập nhật chi nhánh.');
      }
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _delete(Map<String, dynamic> branch) async {
    if (!boolValue(_permissions['delete_branches'])) return;
    final id = intValue(branch['id']);
    if (id == null) return;
    final ok = await confirmDialog(
      context,
      'Xóa chi nhánh "${textOf(branch['name'])}"? Tất cả tin tuyển, hồ sơ ứng tuyển, HR và quản lý chi nhánh thuộc chi nhánh này sẽ bị xóa.',
    );
    if (!ok) return;
    try {
      setState(() {
        _branches = _branches
            .where((item) => intValue(item['id']) != id)
            .toList();
      });
      await widget.api.deleteBranch(id);
      showSnack(context, 'Đã xóa chi nhánh và dữ liệu liên quan.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final canCreate =
        boolValue(_permissions['create_branches']) ||
        widget.session.canEmployer('create_branches');
    final canUpdate =
        boolValue(_permissions['update_branches']) ||
        boolValue(_permissions['update_own_branch']) ||
        widget.session.canEmployer('update_branches');
    final canDelete =
        boolValue(_permissions['delete_branches']) ||
        widget.session.canEmployer('delete_branches');

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: 'Chi nhánh',
            title: 'Quản lý chi nhánh',
            subtitle:
                'Mỗi chi nhánh có địa chỉ, tọa độ bản đồ và thông tin liên hệ riêng.',
            trailing: canCreate
                ? FilledButton.icon(
                    onPressed: () => _upsert(),
                    icon: const Icon(Icons.add_location_alt_outlined),
                    label: const Text('Thêm chi nhánh'),
                  )
                : null,
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_branches.isEmpty)
            const EmptyState(
              message: 'Chưa có chi nhánh trong phạm vi của bạn.',
            )
          else
            for (final branch in _branches)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            boolValue(branch['is_headquarters'])
                                ? Icons.domain_outlined
                                : Icons.apartment_outlined,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  textOf(branch['name']),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  textOf(branch['address'], 'Chưa có địa chỉ'),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  '${textOf(branch['contact_name'], 'Chưa có liên hệ')} • ${textOf(branch['phone'], 'Chưa có SĐT')}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ResponsiveButtonGroup(
                        alignment: WrapAlignment.end,
                        stretchBelow: 320,
                        children: [
                          Chip(
                            label: Text(
                              boolValue(branch['is_active'])
                                  ? 'Hoạt động'
                                  : 'Tạm khóa',
                            ),
                          ),
                          if (canUpdate)
                            OutlinedButton.icon(
                              onPressed: () => _upsert(branch),
                              icon: const Icon(
                                Icons.edit_location_alt_outlined,
                              ),
                              label: const Text('Sửa'),
                            ),
                          if (canDelete &&
                              !boolValue(branch['is_headquarters']))
                            OutlinedButton.icon(
                              onPressed: () => _delete(branch),
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Xóa'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class EmployerMembersScreen extends StatefulWidget {
  const EmployerMembersScreen({
    super.key,
    required this.api,
    required this.session,
  });

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<EmployerMembersScreen> createState() => _EmployerMembersScreenState();
}

class _EmployerMembersScreenState extends State<EmployerMembersScreen> {
  List<Map<String, dynamic>> _members = [];
  List<Map<String, dynamic>> _branches = [];
  Map<String, dynamic> _permissions = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final results = await Future.wait([
        widget.api.employerMe(),
        widget.api.employerMembers(),
      ]);
      final payload = asMap(results[0]);
      await widget.session.updateUser({...widget.session.user, ...payload});
      setState(() {
        _branches = listFromResponse(payload, key: 'branches');
        _permissions = asMap(payload['permissions']);
        _members = results[1] as List<Map<String, dynamic>>;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _upsert([Map<String, dynamic>? member]) async {
    final canCreate = boolValue(_permissions['create_members']);
    final canUpdate = boolValue(_permissions['update_members']);
    if (member == null && !canCreate) return;
    if (member != null && !canUpdate) return;

    final result = await showMemberDialog(
      context,
      branches: _branches,
      actorRole: textOf(_permissions['role'], widget.session.employerRole),
      member: member,
    );
    if (result == null) return;
    try {
      if (member == null) {
        final created = await widget.api.createMember(result);
        final tempPassword = textOf(created['temporary_password']);
        showSnack(
          context,
          tempPassword.isEmpty
              ? 'Đã tạo tài khoản.'
              : 'Đã tạo tài khoản. Mật khẩu tạm: $tempPassword',
        );
      } else {
        await widget.api.updateMember(intValue(member['id'])!, result);
        showSnack(context, 'Đã cập nhật tài khoản.');
      }
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _setLocked(Map<String, dynamic> member, bool locked) async {
    final id = intValue(member['id']);
    if (id == null || !boolValue(_permissions['lock_members'])) return;
    try {
      if (locked) {
        await widget.api.updateMember(id, {
          'status': 'inactive',
          'is_active': false,
        });
        showSnack(context, 'Đã khóa tài khoản.');
      } else {
        await widget.api.updateMember(id, {
          'status': 'active',
          'is_active': true,
        });
        showSnack(context, 'Đã mở khóa tài khoản.');
      }
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _delete(Map<String, dynamic> member) async {
    final id = intValue(member['id']);
    if (id == null || !boolValue(_permissions['lock_members'])) return;
    if (textOf(member['role']) == 'company_owner') return;
    final ok = await confirmDialog(
      context,
      'Xóa tài khoản "${textOf(member['name'], textOf(asMap(member['user'])['email']))}" khỏi công ty? Tài khoản đăng nhập này sẽ bị xóa.',
    );
    if (!ok) return;
    try {
      setState(() {
        _members = _members
            .where((item) => intValue(item['id']) != id)
            .toList();
      });
      await widget.api.deleteMember(id);
      showSnack(context, 'Đã xóa tài khoản.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final canCreate =
        boolValue(_permissions['create_members']) ||
        widget.session.canEmployer('create_members');
    final canUpdate =
        boolValue(_permissions['update_members']) ||
        widget.session.canEmployer('update_members');
    final canLock =
        boolValue(_permissions['lock_members']) ||
        widget.session.canEmployer('lock_members');

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: 'Phân quyền',
            title: 'Nhân sự chi nhánh',
            subtitle:
                'Company owner quản lý branch manager và HR; branch manager chỉ quản lý HR trong chi nhánh mình.',
            trailing: canCreate
                ? FilledButton.icon(
                    onPressed: () => _upsert(),
                    icon: const Icon(Icons.person_add_alt),
                    label: const Text('Tạo tài khoản'),
                  )
                : null,
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_members.isEmpty)
            const EmptyState(
              message: 'Chưa có tài khoản trong phạm vi quản lý.',
            )
          else
            for (final member in _members)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.badge_outlined),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  textOf(
                                    member['name'],
                                    textOf(asMap(member['user'])['email']),
                                  ),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  memberRoleText(textOf(member['role'])),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  textOf(
                                    asMap(member['branch'])['name'],
                                    'Toàn công ty',
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                Text(
                                  '${textOf(asMap(member['user'])['email'])} • ${textOf(member['phone'], 'Chưa có SĐT')}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ResponsiveButtonGroup(
                        alignment: WrapAlignment.end,
                        stretchBelow: 320,
                        children: [
                          Chip(
                            label: Text(
                              textOf(member['status']) == 'inactive'
                                  ? 'Đã khóa'
                                  : 'Hoạt động',
                            ),
                          ),
                          if (canUpdate)
                            OutlinedButton.icon(
                              onPressed: () => _upsert(member),
                              icon: const Icon(Icons.edit_outlined),
                              label: const Text('Sửa'),
                            ),
                          if (canLock &&
                              textOf(member['role']) != 'company_owner')
                            OutlinedButton.icon(
                              onPressed: () => _setLocked(
                                member,
                                textOf(member['status']) != 'inactive',
                              ),
                              icon: Icon(
                                textOf(member['status']) == 'inactive'
                                    ? Icons.lock_open_outlined
                                    : Icons.lock_outline,
                              ),
                              label: Text(
                                textOf(member['status']) == 'inactive'
                                    ? 'Mở khóa'
                                    : 'Khóa',
                              ),
                            ),
                          if (canLock &&
                              textOf(member['role']) != 'company_owner')
                            OutlinedButton.icon(
                              onPressed: () => _delete(member),
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Xóa'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class EmployerBillingScreen extends StatefulWidget {
  const EmployerBillingScreen({super.key, required this.api});

  final RecruitmentApi api;

  @override
  State<EmployerBillingScreen> createState() => _EmployerBillingScreenState();
}

class _EmployerBillingScreenState extends State<EmployerBillingScreen> {
  Map<String, dynamic> _summary = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final summary = await widget.api.employerBillingSummary();
      setState(() {
        _summary = summary;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _checkout(String planKey) async {
    try {
      final result = await widget.api.createBillingCheckout(planKey);
      final url = textOf(result['checkout_url']);
      if (url.isNotEmpty) await launchExternal(url);
      showSnack(context, 'Đã tạo liên kết thanh toán.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _syncLatest() async {
    final latest = asMap(_summary['latest_payment']);
    final orderCode = latest['order_code'];
    if (orderCode == null) {
      showSnack(context, 'Chưa có giao dịch để đồng bộ.', isError: true);
      return;
    }
    try {
      final result = await widget.api.syncBillingPayment(orderCode);
      setState(() => _summary = asMap(result['summary']));
      showSnack(context, 'Đã đồng bộ giao dịch.');
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final current = asMap(_summary['current_subscription']);
    final currentRank = intValue(current['plan_rank']) ?? -1;
    final latest = asMap(_summary['latest_payment']);
    final plans = listFromResponse(
      _summary,
      key: 'plans',
    ).where((plan) => (intValue(plan['rank']) ?? 0) >= currentRank).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: 'Thanh toán',
            title: 'Gói dịch vụ nhà tuyển dụng',
            subtitle: current.isEmpty
                ? 'Chọn một gói để mở quyền đăng tin và quản lý tuyển dụng.'
                : '${textOf(current['plan_name'])} còn ${textOf(current['remaining_job_posts'], '0')} tin, hết hạn ${textOf(current['ends_at'])}.',
            trailing: OutlinedButton.icon(
              onPressed: _syncLatest,
              icon: const Icon(Icons.sync),
              label: const Text('Đồng bộ'),
            ),
          ),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else ...[
            if (latest.isNotEmpty)
              Card(
                child: ListTile(
                  leading: const Icon(Icons.receipt_long_outlined),
                  title: Text(
                    'Giao dịch gần nhất #${textOf(latest['order_code'])}',
                  ),
                  subtitle: Text(
                    '${moneyText(latest['amount'])} • ${textOf(latest['status'])}',
                  ),
                ),
              ),
            for (final plan in plans)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final title = Text(
                            textOf(plan['name']),
                            softWrap: true,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.w900),
                          );
                          final active =
                              textOf(current['plan_key']) == textOf(plan['key'])
                              ? const Chip(label: Text('Đang dùng'))
                              : null;
                          if (active != null && constraints.maxWidth < 360) {
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                title,
                                const SizedBox(height: 6),
                                active,
                              ],
                            );
                          }
                          return Row(
                            children: [
                              Expanded(child: title),
                              if (active != null) ...[
                                const SizedBox(width: 8),
                                active,
                              ],
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      Text(
                        moneyText(plan['amount']),
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      Text(
                        '${textOf(plan['job_posts'])} tin tuyển dụng • ${textOf(plan['duration_days'])} ngày',
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final feature in listFromAny(plan['features']))
                            Chip(label: Text(textOf(feature))),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed:
                              textOf(current['plan_key']) == textOf(plan['key'])
                              ? null
                              : () => _checkout(textOf(plan['key'])),
                          icon: const Icon(Icons.payment_outlined),
                          label: Text(
                            textOf(current['plan_key']) == textOf(plan['key'])
                                ? 'Đang sử dụng'
                                : 'Thanh toán',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class EmployerJobsScreen extends StatefulWidget {
  const EmployerJobsScreen({
    super.key,
    required this.api,
    required this.session,
  });

  final RecruitmentApi api;
  final AuthSession session;

  @override
  State<EmployerJobsScreen> createState() => _EmployerJobsScreenState();
}

class _EmployerJobsScreenState extends State<EmployerJobsScreen> {
  final _keyword = TextEditingController();
  List<Map<String, dynamic>> _jobs = [];
  List<Map<String, dynamic>> _industries = [];
  List<Map<String, dynamic>> _jtypes = [];
  List<Map<String, dynamic>> _jlevels = [];
  List<Map<String, dynamic>> _skills = [];
  List<Map<String, dynamic>> _branches = [];
  Map<String, dynamic> _permissions = {};
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _keyword.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final results = await Future.wait([
        widget.api.employerMe(),
        widget.api.industries(),
        widget.api.jtypes(),
        widget.api.jlevels(),
        widget.api.jskills(),
        widget.api.employerJobs(keyword: _keyword.text.trim()),
      ]);
      final employerPayload = asMap(results[0]);
      await widget.session.updateUser({
        ...widget.session.user,
        ...employerPayload,
      });
      setState(() {
        _permissions = asMap(employerPayload['permissions']);
        _branches = listFromResponse(employerPayload, key: 'branches');
        _industries = results[1] as List<Map<String, dynamic>>;
        _jtypes = results[2] as List<Map<String, dynamic>>;
        _jlevels = results[3] as List<Map<String, dynamic>>;
        _skills = results[4] as List<Map<String, dynamic>>;
        _jobs = results[5] as List<Map<String, dynamic>>;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _upsert([Map<String, dynamic>? job]) async {
    try {
      final employerPayload = await widget.api.employerMe();
      await widget.session.updateUser({
        ...widget.session.user,
        ...employerPayload,
      });
      setState(() {
        _permissions = asMap(employerPayload['permissions']);
        _branches = listFromResponse(employerPayload, key: 'branches');
      });
    } catch (_) {
      // The dialog will still use the latest loaded reference data.
    }
    List<Map<String, dynamic>> selectedSkills = [];
    if (job != null) {
      final id = intValue(job['id']);
      if (id != null) selectedSkills = await widget.api.jobSkills(id);
    }
    final result = await showJobFormDialog(
      context,
      job: job,
      jtypes: _jtypes,
      jlevels: _jlevels,
      industries: _industries,
      branches: _branches,
      skills: _skills,
      selectedSkills: selectedSkills,
      api: widget.api,
    );
    if (result == null) return;
    try {
      if (job == null) {
        await widget.api.createJob(result);
      } else {
        await widget.api.updateJob(intValue(job['id'])!, result);
      }
      showSnack(
        context,
        job == null ? 'Đã tạo tin tuyển dụng.' : 'Đã cập nhật tin tuyển dụng.',
      );
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _toggle(Map<String, dynamic> job) async {
    final id = intValue(job['id']);
    if (id == null) return;
    final next = !boolValue(job['is_active']);
    try {
      await widget.api.changeJobStatus(id, next);
      showSnack(context, 'Đã cập nhật trạng thái.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  Future<void> _delete(Map<String, dynamic> job) async {
    final id = intValue(job['id']);
    if (id == null) return;
    final ok = await confirmDialog(
      context,
      'Xóa tin "${textOf(job['jname'])}"? Hồ sơ ứng tuyển, tin nhắn và dữ liệu liên quan của tin này sẽ bị xóa.',
    );
    if (!ok) return;
    try {
      setState(() {
        _jobs = _jobs.where((item) => intValue(item['id']) != id).toList();
      });
      await widget.api.deleteJob(id);
      showSnack(context, 'Đã xóa tin tuyển dụng.');
      await _load();
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final canManage =
        boolValue(_permissions['manage_jobs']) ||
        widget.session.canEmployer('manage_jobs');
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          PageIntro(
            eyebrow: 'Tin tuyển dụng',
            title: 'Quản lý tin tuyển',
            subtitle: '${_jobs.length} tin trong danh sách hiện tại.',
            trailing: canManage
                ? FilledButton.icon(
                    onPressed: _branches.isEmpty ? null : () => _upsert(),
                    icon: const Icon(Icons.add),
                    label: const Text('Tạo tin'),
                  )
                : null,
          ),
          TextField(
            controller: _keyword,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              labelText: 'Tìm theo tên, hình thức, cấp bậc',
            ),
            onSubmitted: (_) => _load(),
          ),
          const SizedBox(height: 14),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_jobs.isEmpty)
            const EmptyState(message: 'Chưa có tin tuyển dụng.')
          else
            for (final job in _jobs)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.work_outline),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  textOf(job['jname']),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${textOf(job['jtype_name'])} • ${textOf(job['jlevel_name'])}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  '${textOf(asMap(job['branch'])['name'], 'Chưa gắn chi nhánh')} • Hạn: ${textOf(job['deadline'], textOf(job['expire_at']))}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      if (canManage)
                        ResponsiveButtonGroup(
                          alignment: WrapAlignment.end,
                          stretchBelow: 320,
                          children: [
                            FilterChip(
                              label: Text(
                                boolValue(job['is_active'])
                                    ? 'Đang mở'
                                    : 'Tạm dừng',
                              ),
                              selected: boolValue(job['is_active']),
                              onSelected: (_) => _toggle(job),
                              avatar: Icon(
                                boolValue(job['is_active'])
                                    ? Icons.toggle_on_outlined
                                    : Icons.toggle_off_outlined,
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => _upsert(job),
                              icon: const Icon(Icons.edit_outlined),
                              label: const Text('Sửa tin'),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => _delete(job),
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Xóa'),
                            ),
                          ],
                        )
                      else
                        Chip(
                          label: Text(
                            boolValue(job['is_active'])
                                ? 'Đang mở'
                                : 'Tạm dừng',
                          ),
                        ),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class EmployerApplicationsScreen extends StatefulWidget {
  const EmployerApplicationsScreen({
    super.key,
    required this.api,
    required this.config,
  });

  final RecruitmentApi api;
  final ApiConfig config;

  @override
  State<EmployerApplicationsScreen> createState() =>
      _EmployerApplicationsScreenState();
}

class _EmployerApplicationsScreenState
    extends State<EmployerApplicationsScreen> {
  final _keyword = TextEditingController();
  final List<_StatusFilter> _filters = const [
    _StatusFilter('WAITING', 'Duyệt CV'),
    _StatusFilter('BROWSING_INTERVIEW', 'Phỏng vấn'),
    _StatusFilter('PASSED', 'Đã nhận'),
    _StatusFilter('RESUME_FAILED', 'Loại CV'),
    _StatusFilter('INTERVIEW_FAILED', 'Loại PV'),
  ];
  String _status = 'WAITING';
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _keyword.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final items = await widget.api.applications(
        keyword: _keyword.text.trim(),
        status: _status,
      );
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _process(Map<String, dynamic> candidate, String actType) async {
    if (actType == 'VIEWED') {
      try {
        if (textOf(candidate['status']) == 'WAITING') {
          await widget.api.processApplying({...candidate, 'actType': 'VIEWED'});
        }
        final cvLink = textOf(candidate['cv_link']);
        if (cvLink.isNotEmpty) {
          await openPdfViewer(
            context,
            widget.config,
            cvLink,
            title: 'CV ${fullName(candidate)}',
          );
        } else {
          final resumeId = intValue(candidate['resume_id']);
          if (resumeId != null) {
            final detail = await widget.api.employerResumeDetail(resumeId);
            if (!context.mounted) return;
            showResumeSheet(context, detail);
          } else {
            showSnack(context, 'Hồ sơ này chưa có CV để xem.', isError: true);
          }
        }
        await _load();
      } catch (error) {
        showSnack(context, error.toString(), isError: true);
      }
      return;
    }
    final message = await showApplicationMessageDialog(
      context,
      candidate,
      actType,
      _status,
    );
    if (message == null) return;
    final beforeItems = [..._items];
    final jobId = intValue(candidate['job_id']);
    final candidateId = intValue(candidate['candidate_id'] ?? candidate['id']);
    try {
      setState(() {
        _items = _items.where((item) {
          final sameJob = intValue(item['job_id']) == jobId;
          final sameCandidate =
              intValue(item['candidate_id'] ?? item['id']) == candidateId;
          return !(sameJob && sameCandidate);
        }).toList();
      });
      showSnack(context, 'Đã chuyển hồ sơ sang giai đoạn mới.');
      await widget.api.processApplying({
        ...candidate,
        ...message,
        'actType': actType,
      });
      await _load();
    } catch (error) {
      if (mounted) setState(() => _items = beforeItems);
      showSnack(context, error.toString(), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Ứng viên',
            title: 'Quản lý hồ sơ ứng tuyển',
            subtitle:
                'Duyệt CV, phản hồi phỏng vấn và gửi thông báo cho ứng viên.',
          ),
          TextField(
            controller: _keyword,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              labelText: 'Tìm tên, email hoặc vị trí',
            ),
            onSubmitted: (_) => _load(),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final filter in _filters)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(filter.label),
                      selected: _status == filter.value,
                      onSelected: (_) {
                        setState(() => _status = filter.value);
                        _load();
                      },
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else if (_items.isEmpty)
            const EmptyState(message: 'Không có hồ sơ ở trạng thái này.')
          else
            for (final item in _items)
              CandidateApplicationCard(
                item: item,
                onView: () => _process(item, 'VIEWED'),
                onAccept: _status == 'PASSED' || _status.contains('FAILED')
                    ? null
                    : () => _process(item, 'ACCEPT'),
                onReject: _status == 'PASSED' || _status.contains('FAILED')
                    ? null
                    : () => _process(item, 'REJECT'),
              ),
        ],
      ),
    );
  }
}

class _StatusFilter {
  const _StatusFilter(this.value, this.label);
  final String value;
  final String label;
}

class EmployerTalentScreen extends StatefulWidget {
  const EmployerTalentScreen({
    super.key,
    required this.api,
    required this.session,
    required this.config,
  });

  final RecruitmentApi api;
  final AuthSession session;
  final ApiConfig config;

  @override
  State<EmployerTalentScreen> createState() => _EmployerTalentScreenState();
}

class _EmployerTalentScreenState extends State<EmployerTalentScreen> {
  final _keyword = TextEditingController();
  final _address = TextEditingController();
  final _school = TextEditingController();
  final _major = TextEditingController();
  final _experience = TextEditingController();
  final _project = TextEditingController();
  List<Map<String, dynamic>> _skills = [];
  List<Map<String, dynamic>> _jobs = [];
  List<Map<String, dynamic>> _candidates = [];
  List<Map<String, dynamic>> _recommendations = [];
  final Set<int> _skillIds = {};
  String _gender = '';
  String _jobId = '';
  bool _hasLocation = false;
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final controller in [
      _keyword,
      _address,
      _school,
      _major,
      _experience,
      _project,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final results = await Future.wait([
        widget.api.jskills(),
        widget.api.employerJobs(),
        widget.api.talentRecommendations(),
        widget.api.searchCandidates(_filters()),
      ]);
      setState(() {
        _skills = results[0];
        _jobs = results[1];
        _recommendations = results[2];
        _candidates = results[3];
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Map<String, dynamic> _filters() => {
    'keyword': _keyword.text.trim(),
    'gender': _gender,
    'address': _address.text.trim(),
    'school': _school.text.trim(),
    'major': _major.text.trim(),
    'experience': _experience.text.trim(),
    'project': _project.text.trim(),
    'skill_ids': _skillIds.toList(),
    'job_id': _jobId,
    'has_location': _hasLocation,
  };

  Future<void> _search() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final candidates = await widget.api.searchCandidates(_filters());
      setState(() {
        _candidates = candidates;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _contact(Map<String, dynamic> candidate, int? jobId) async {
    final targetJobId = jobId ?? intValue(_jobId);
    if (targetJobId == null) {
      showSnack(context, 'Chọn một job để liên hệ ứng viên.', isError: true);
      return;
    }
    final result = await showContactCandidateDialog(
      context,
      candidate,
      targetJobId,
      _jobs,
    );
    if (result == null) return;
    try {
      showSnack(context, 'Đã ghi nhận yêu cầu liên hệ ứng viên.');
      await widget.api.contactCandidate(result);
    } catch (error) {
      showSnack(context, error.toString(), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
        children: [
          const PageIntro(
            eyebrow: 'Talent discovery',
            title: 'Tìm kiếm ứng viên',
            subtitle:
                'Lọc hồ sơ theo kỹ năng, học vấn, kinh nghiệm và job đang tuyển.',
          ),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  TextField(
                    controller: _keyword,
                    decoration: const InputDecoration(labelText: 'Từ khóa'),
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      DropdownButtonFormField<String>(
                        initialValue: _gender,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Giới tính',
                        ),
                        items: const [
                          DropdownMenuItem(value: '', child: Text('Tất cả')),
                          DropdownMenuItem(value: '1', child: Text('Nam')),
                          DropdownMenuItem(value: '0', child: Text('Nữ')),
                        ],
                        onChanged: (value) =>
                            setState(() => _gender = value ?? ''),
                      ),
                      DropdownButtonFormField<String>(
                        initialValue: _jobId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Job liên hệ',
                        ),
                        items: [
                          const DropdownMenuItem(
                            value: '',
                            child: Text('Chọn job'),
                          ),
                          for (final job in _jobs)
                            DropdownMenuItem(
                              value: textOf(job['id']),
                              child: Text(
                                textOf(job['jname']),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                        onChanged: (value) =>
                            setState(() => _jobId = value ?? ''),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      TextField(
                        controller: _address,
                        decoration: const InputDecoration(labelText: 'Khu vực'),
                      ),
                      TextField(
                        controller: _school,
                        decoration: const InputDecoration(labelText: 'Trường'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      TextField(
                        controller: _major,
                        decoration: const InputDecoration(
                          labelText: 'Chuyên ngành',
                        ),
                      ),
                      TextField(
                        controller: _experience,
                        decoration: const InputDecoration(
                          labelText: 'Kinh nghiệm',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _project,
                    decoration: const InputDecoration(
                      labelText: 'Dự án / công nghệ',
                    ),
                  ),
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final skill in _skills.take(18))
                          FilterChip(
                            label: Text(textOf(skill['name'])),
                            selected: _skillIds.contains(intValue(skill['id'])),
                            onSelected: (selected) {
                              final id = intValue(skill['id']);
                              if (id == null) return;
                              setState(
                                () => selected
                                    ? _skillIds.add(id)
                                    : _skillIds.remove(id),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _hasLocation,
                    onChanged: (value) => setState(() => _hasLocation = value),
                    title: const Text('Chỉ hồ sơ đã ghim bản đồ'),
                  ),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _search,
                      icon: const Icon(Icons.search),
                      label: const Text('Tìm kiếm'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          if (_loading)
            const LoadingList()
          else if (_error.isNotEmpty)
            ErrorPanel(message: _error, onRetry: _load)
          else ...[
            SectionHeader(
              title: 'Gợi ý phù hợp',
              subtitle: '${_recommendations.length} gợi ý theo kỹ năng job',
            ),
            if (_recommendations.isEmpty)
              const EmptyState(
                message: 'Chưa có gợi ý. Hãy thêm kỹ năng yêu cầu cho job.',
              )
            else
              for (final rec in _recommendations.take(8))
                Builder(
                  builder: (context) {
                    final candidate = candidateFromMatch(rec);
                    return CandidateTalentCard(
                      candidate: candidate,
                      config: widget.config,
                      badge: '${textOf(rec['match_percent'], '0')}%',
                      subtitle:
                          'Phù hợp với ${textOf(asMap(rec['job'])['jname'])}',
                      reasons: matchReasons(rec),
                      onContact: () => _contact(
                        candidate,
                        intValue(asMap(rec['job'])['id']),
                      ),
                    );
                  },
                ),
            const SizedBox(height: 12),
            SectionHeader(
              title: 'Danh sách ứng viên',
              subtitle: '${_candidates.length} hồ sơ phù hợp bộ lọc',
            ),
            if (_candidates.isEmpty)
              const EmptyState(message: 'Không có ứng viên phù hợp.')
            else
              for (final item in _candidates)
                Builder(
                  builder: (context) {
                    final candidate = candidateFromMatch(item);
                    return CandidateTalentCard(
                      candidate: candidate,
                      config: widget.config,
                      badge: textOf(item['match_percent']).isEmpty
                          ? null
                          : '${item['match_percent']}%',
                      reasons: matchReasons(item),
                      onContact: () => _contact(candidate, null),
                    );
                  },
                ),
          ],
        ],
      ),
    );
  }
}

class PageIntro extends StatelessWidget {
  const PageIntro({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  final String eyebrow;
  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final textBlock = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eyebrow.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                softWrap: true,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF102A27),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                softWrap: true,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.black54),
              ),
            ],
          );
          if (trailing != null && constraints.maxWidth < 560) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                textBlock,
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerLeft,
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: constraints.maxWidth),
                    child: trailing!,
                  ),
                ),
              ],
            );
          }
          return Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(child: textBlock),
              if (trailing != null) ...[
                const SizedBox(width: 12),
                Flexible(
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: trailing!,
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final textBlock = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                softWrap: true,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              if (subtitle != null)
                Text(
                  subtitle!,
                  softWrap: true,
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: Colors.black54),
                ),
            ],
          );
          if (trailing != null && constraints.maxWidth < 460) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [textBlock, const SizedBox(height: 8), trailing!],
            );
          }
          return Row(
            children: [
              Expanded(child: textBlock),
              ?trailing,
            ],
          );
        },
      ),
    );
  }
}

class ResponsiveFormRow extends StatelessWidget {
  const ResponsiveFormRow({
    super.key,
    required this.children,
    this.spacing = 10,
    this.minChildWidth = 180,
  });

  final List<Widget> children;
  final double spacing;
  final double minChildWidth;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final shouldStack =
            constraints.maxWidth < (children.length * minChildWidth) ||
            constraints.maxWidth.isInfinite;
        if (shouldStack) {
          return Column(
            children: [
              for (var index = 0; index < children.length; index++) ...[
                if (index > 0) SizedBox(height: spacing),
                children[index],
              ],
            ],
          );
        }
        return Row(
          children: [
            for (var index = 0; index < children.length; index++) ...[
              if (index > 0) SizedBox(width: spacing),
              Expanded(child: children[index]),
            ],
          ],
        );
      },
    );
  }
}

class ResponsiveButtonGroup extends StatelessWidget {
  const ResponsiveButtonGroup({
    super.key,
    required this.children,
    this.spacing = 8,
    this.runSpacing = 8,
    this.stretchBelow = 380,
    this.alignment = WrapAlignment.start,
  });

  final List<Widget> children;
  final double spacing;
  final double runSpacing;
  final double stretchBelow;
  final WrapAlignment alignment;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final shouldStretch =
            constraints.maxWidth.isFinite &&
            constraints.maxWidth < stretchBelow;
        return Wrap(
          spacing: spacing,
          runSpacing: runSpacing,
          alignment: alignment,
          children: [
            for (final child in children)
              shouldStretch
                  ? SizedBox(width: constraints.maxWidth, child: child)
                  : child,
          ],
        );
      },
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
            ),
            Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class JobCard extends StatelessWidget {
  const JobCard({
    super.key,
    required this.job,
    required this.config,
    required this.onTap,
  });

  final Map<String, dynamic> job;
  final ApiConfig config;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final employer = asMap(job['employer']);
    final locations = listFromResponse(job, key: 'locations');
    final branch = asMap(job['branch']);
    final locationText = textOf(
      job['location'],
      textOf(
        branch['name'],
        locations.isEmpty
            ? textOf(job['address'], 'Linh hoạt')
            : locations.map((e) => textOf(e['name'])).join(', '),
      ),
    );
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  AppAvatar(
                    url: config.resolveAssetUrl(textOf(employer['logo'])),
                    label: textOf(employer['name'], 'Công ty'),
                    radius: 24,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          textOf(job['jname']),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          textOf(
                            employer['name'],
                            textOf(job['name'], 'Nhà tuyển dụng'),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  if (boolValue(job['is_hot']))
                    const Chip(
                      backgroundColor: Color(0xFFFFF1E6),
                      side: BorderSide(color: Color(0xFFF59E0B)),
                      label: Text(
                        'HOT',
                        style: TextStyle(
                          color: Color(0xFF92400E),
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  InfoPill(
                    icon: Icons.payments_outlined,
                    text: salaryText(job),
                  ),
                  InfoPill(icon: Icons.place_outlined, text: locationText),
                  InfoPill(
                    icon: Icons.event_outlined,
                    text:
                        'Hạn ${textOf(job['deadline'], textOf(job['expire_at'], 'đang tuyển'))}',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CompanyCard extends StatelessWidget {
  const CompanyCard({
    super.key,
    required this.company,
    required this.config,
    required this.onTap,
    this.trailing,
  });

  final Map<String, dynamic> company;
  final ApiConfig config;
  final VoidCallback onTap;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: AppAvatar(
          url: config.resolveAssetUrl(textOf(company['logo'])),
          label: textOf(company['name']),
          radius: 24,
        ),
        title: Text(
          textOf(company['name']),
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(
          textOf(
            company['address'],
            '${textOf(company['job_num'], '0')} việc đang tuyển',
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: trailing == null
            ? const Icon(Icons.chevron_right)
            : Chip(label: Text(trailing!)),
        onTap: onTap,
      ),
    );
  }
}

class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    required this.url,
    required this.label,
    this.radius = 24,
  });

  final String url;
  final String label;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final initials = label.trim().isEmpty
        ? '?'
        : label
              .trim()
              .split(RegExp(r'\s+'))
              .take(2)
              .map((part) => part.characters.first.toUpperCase())
              .join();
    return CircleAvatar(
      radius: radius,
      backgroundColor: const Color(0xFFE3F4EF),
      foregroundColor: const Color(0xFF0F766E),
      backgroundImage: url.isEmpty ? null : NetworkImage(url),
      onBackgroundImageError: url.isEmpty ? null : (exception, stackTrace) {},
      child: url.isEmpty
          ? Text(initials, style: const TextStyle(fontWeight: FontWeight.w900))
          : null,
    );
  }
}

class InfoPill extends StatelessWidget {
  const InfoPill({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final maxPillWidth = (MediaQuery.sizeOf(context).width - 56)
        .clamp(160.0, 520.0)
        .toDouble();
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxPillWidth),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF7F4),
          borderRadius: BorderRadius.circular(99),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 5),
            Flexible(
              child: Text(text, maxLines: 1, overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
      ),
    );
  }
}

class LoadingList extends StatelessWidget {
  const LoadingList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 4,
      itemBuilder: (context, index) => Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(width: 16),
              Expanded(child: Text('Đang tải dữ liệu ${index + 1}...')),
            ],
          ),
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Center(
          child: Column(
            children: [
              Icon(
                Icons.inbox_outlined,
                size: 42,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 8),
              Text(message, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class ErrorPanel extends StatelessWidget {
  const ErrorPanel({super.key, required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Không tải được dữ liệu',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(message),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileSectionPanel extends StatelessWidget {
  const ProfileSectionPanel({
    super.key,
    required this.section,
    required this.items,
    required this.onAdd,
    required this.onEdit,
    required this.onDelete,
  });

  final ProfileSection section;
  final List<Map<String, dynamic>> items;
  final VoidCallback onAdd;
  final ValueChanged<Map<String, dynamic>> onEdit;
  final ValueChanged<Map<String, dynamic>> onDelete;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: section.label,
          trailing: IconButton.filledTonal(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
          ),
        ),
        if (items.isEmpty)
          EmptyState(message: 'Chưa có ${section.label.toLowerCase()}.')
        else
          for (final item in items)
            Card(
              child: ListTile(
                title: Text(
                  section.titleOf(item),
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(
                  section.subtitleOf(item),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: () => onEdit(item),
                      icon: const Icon(Icons.edit_outlined),
                    ),
                    IconButton(
                      onPressed: () => onDelete(item),
                      icon: const Icon(Icons.delete_outline),
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }
}

class CandidateApplicationCard extends StatelessWidget {
  const CandidateApplicationCard({
    super.key,
    required this.item,
    required this.onView,
    this.onAccept,
    this.onReject,
  });

  final Map<String, dynamic> item;
  final VoidCallback onView;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                final info = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName(item),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      textOf(item['jname']),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '${textOf(item['email'])} • ${textOf(item['phone'], 'Chưa có SĐT')}',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                );
                final status = Chip(
                  label: Text(applicationStatusText(textOf(item['status']))),
                );
                if (constraints.maxWidth < 390) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [info, const SizedBox(height: 8), status],
                  );
                }
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: info),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: status,
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 10),
            ResponsiveButtonGroup(
              stretchBelow: 420,
              children: [
                OutlinedButton.icon(
                  onPressed: onView,
                  icon: const Icon(Icons.visibility_outlined),
                  label: const Text('Xem CV'),
                ),
                if (onAccept != null)
                  FilledButton.icon(
                    onPressed: onAccept,
                    icon: const Icon(Icons.check),
                    label: const Text('Chấp nhận'),
                  ),
                if (onReject != null)
                  OutlinedButton.icon(
                    onPressed: onReject,
                    icon: const Icon(Icons.close),
                    label: const Text('Từ chối'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class CandidateTalentCard extends StatelessWidget {
  const CandidateTalentCard({
    super.key,
    required this.candidate,
    required this.config,
    required this.onContact,
    this.badge,
    this.subtitle,
    this.reasons = const [],
  });

  final Map<String, dynamic> candidate;
  final ApiConfig config;
  final VoidCallback onContact;
  final String? badge;
  final String? subtitle;
  final List<String> reasons;

  @override
  Widget build(BuildContext context) {
    final skills = listFromAny(
      candidate['skills'],
    ).map((e) => textOf(e)).where((e) => e.isNotEmpty).take(5).toList();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                final identity = Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppAvatar(
                      url: config.resolveAssetUrl(textOf(candidate['avatar'])),
                      label: fullName(candidate),
                      radius: 28,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            fullName(candidate),
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            subtitle ??
                                '${textOf(candidate['email'])} • ${textOf(candidate['phone'], 'Chưa có SĐT')}',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                );
                if (badge == null) return identity;
                final badgeChip = Chip(label: Text(badge!));
                if (constraints.maxWidth < 390) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [identity, const SizedBox(height: 8), badgeChip],
                  );
                }
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: identity),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: badgeChip,
                      ),
                    ),
                  ],
                );
              },
            ),
            if (textOf(candidate['objective']).isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                textOf(candidate['objective']),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                if (skills.isEmpty)
                  const Chip(label: Text('Chưa cập nhật kỹ năng')),
                for (final skill in skills) Chip(label: Text(skill)),
              ],
            ),
            if (reasons.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (final reason in reasons.take(3))
                    Chip(
                      avatar: const Icon(Icons.check_circle_outline, size: 16),
                      label: Text(reason),
                    ),
                ],
              ),
            ],
            const SizedBox(height: 8),
            ResponsiveButtonGroup(
              alignment: WrapAlignment.end,
              stretchBelow: 320,
              children: [
                FilledButton.icon(
                  onPressed: onContact,
                  icon: const Icon(Icons.mail_outline),
                  label: const Text('Liên hệ'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> showJobDetailSheet(
  BuildContext context, {
  required RecruitmentApi api,
  required AuthSession session,
  required ApiConfig config,
  required int jobId,
}) async {
  if (jobId == 0) return;
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) => FutureBuilder<List<dynamic>>(
      future: Future.wait([
        api.jobDetail(jobId),
        api.jobSkills(jobId),
        if (session.isCandidate)
          api.checkApplying(jobId)
        else
          Future.value(false),
        if (session.isCandidate) api.checkSaved(jobId) else Future.value(false),
      ]),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Text(snapshot.error.toString()),
          );
        }
        if (!snapshot.hasData) {
          return const SizedBox(
            height: 260,
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final job = asMap(snapshot.data![0]);
        final branch = asMap(job['branch']);
        final skills = snapshot.data![1] as List<Map<String, dynamic>>;
        final jobLat = double.tryParse(textOf(job['map_lat']));
        final jobLng = double.tryParse(textOf(job['map_lng']));
        final branchLat = double.tryParse(textOf(branch['map_lat']));
        final branchLng = double.tryParse(textOf(branch['map_lng']));
        final locationLat = jobLat ?? branchLat;
        final locationLng = jobLng ?? branchLng;
        var applied = snapshot.data![2] as bool;
        var saved = snapshot.data![3] as bool;
        return StatefulBuilder(
          builder: (context, setSheetState) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.88,
            maxChildSize: 0.96,
            minChildSize: 0.55,
            builder: (context, controller) => ListView(
              controller: controller,
              padding: const EdgeInsets.all(18),
              children: [
                Text(
                  textOf(job['jname']),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(textOf(asMap(job['employer'])['name'], 'Nhà tuyển dụng')),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    InfoPill(
                      icon: Icons.payments_outlined,
                      text: salaryText(job),
                    ),
                    InfoPill(
                      icon: Icons.place_outlined,
                      text: textOf(
                        job['location'],
                        textOf(branch['name'], textOf(job['address'])),
                      ),
                    ),
                    InfoPill(
                      icon: Icons.event_outlined,
                      text: 'Hạn ${textOf(job['expire_at'])}',
                    ),
                    InfoPill(
                      icon: Icons.people_outline,
                      text: '${textOf(job['amount'], '0')} người',
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (locationLat != null && locationLng != null) ...[
                  OutlinedButton.icon(
                    onPressed: () => openMapLocation(
                      lat: locationLat,
                      lng: locationLng,
                      label: textOf(branch['name'], textOf(job['jname'])),
                    ),
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('Xem vị trí trên Google Maps'),
                  ),
                  const SizedBox(height: 12),
                ],
                if (skills.isNotEmpty)
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      for (final skill in skills)
                        Chip(label: Text(textOf(skill['name']))),
                    ],
                  ),
                const SizedBox(height: 12),
                Text(
                  textOf(job['description']),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 18),
                if (session.isCandidate)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            try {
                              await api.setSavedJob(jobId, !saved);
                              setSheetState(() => saved = !saved);
                              session.markCandidateJobsChanged();
                            } catch (error) {
                              showSnack(
                                context,
                                error.toString(),
                                isError: true,
                              );
                            }
                          },
                          icon: Icon(
                            saved ? Icons.bookmark : Icons.bookmark_border,
                          ),
                          label: Text(saved ? 'Đã lưu' : 'Lưu việc'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: applied
                              ? null
                              : () async {
                                  final success = await showApplyDialog(
                                    context,
                                    api,
                                    jobId,
                                    companyName: textOf(
                                      asMap(job['employer'])['name'],
                                      'nhà tuyển dụng',
                                    ),
                                  );
                                  if (success) {
                                    setSheetState(() => applied = true);
                                    session.markCandidateJobsChanged();
                                  }
                                },
                          icon: const Icon(Icons.send_outlined),
                          label: Text(applied ? 'Đã ứng tuyển' : 'Ứng tuyển'),
                        ),
                      ),
                    ],
                  )
                else if (!session.isAuthenticated)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Đăng nhập bằng tài khoản ứng viên để lưu việc hoặc ứng tuyển.',
                      ),
                      const SizedBox(height: 10),
                      FilledButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.login),
                        label: const Text('Đã hiểu'),
                      ),
                    ],
                  )
                else
                  FilledButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.check),
                    label: const Text('Đã xem'),
                  ),
              ],
            ),
          ),
        );
      },
    ),
  );
}

Future<void> showCompanyDetailSheet(
  BuildContext parentContext,
  RecruitmentApi api,
  AuthSession session,
  ApiConfig config,
  int companyId,
) async {
  if (companyId == 0) return;
  showModalBottomSheet<void>(
    context: parentContext,
    isScrollControlled: true,
    builder: (sheetContext) => FutureBuilder<List<dynamic>>(
      future: Future.wait([
        api.companyDetail(companyId),
        api.companyJobs(companyId),
      ]),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: ErrorPanel(
              message: snapshot.error.toString(),
              onRetry: () {
                Navigator.of(sheetContext).pop();
                showCompanyDetailSheet(
                  parentContext,
                  api,
                  session,
                  config,
                  companyId,
                );
              },
            ),
          );
        }
        if (!snapshot.hasData) {
          return const SizedBox(
            height: 260,
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final company = asMap(snapshot.data![0]);
        final jobs = snapshot.data![1] as List<Map<String, dynamic>>;
        final companyLat = double.tryParse(textOf(company['map_lat']));
        final companyLng = double.tryParse(textOf(company['map_lng']));
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.85,
          builder: (context, controller) => ListView(
            controller: controller,
            padding: const EdgeInsets.all(18),
            children: [
              AppAvatar(
                url: config.resolveAssetUrl(textOf(company['logo'])),
                label: textOf(company['name']),
                radius: 36,
              ),
              const SizedBox(height: 12),
              Text(
                textOf(company['name']),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(textOf(company['address']), textAlign: TextAlign.center),
              const SizedBox(height: 10),
              Center(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (textOf(company['website']).isNotEmpty)
                      OutlinedButton.icon(
                        onPressed: () =>
                            launchExternal(textOf(company['website'])),
                        icon: const Icon(Icons.public),
                        label: const Text('Website'),
                      ),
                    if (companyLat != null && companyLng != null)
                      OutlinedButton.icon(
                        onPressed: () => openMapLocation(
                          lat: companyLat,
                          lng: companyLng,
                          label: textOf(company['name']),
                        ),
                        icon: const Icon(Icons.map_outlined),
                        label: const Text('Chỉ đường'),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(textOf(company['description'], 'Chưa có mô tả công ty.')),
              const SizedBox(height: 16),
              SectionHeader(
                title: 'Tin đang tuyển',
                subtitle: '${jobs.length} vị trí',
              ),
              for (final job in jobs)
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.work_outline),
                    title: Text(textOf(job['jname'])),
                    subtitle: Text(
                      '${salaryText(job)} • Hạn ${textOf(job['deadline'], textOf(job['expire_at']))}',
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      final jobId = intValue(job['id']) ?? 0;
                      if (jobId == 0) return;
                      Navigator.of(sheetContext).pop();
                      Future<void>.delayed(
                        const Duration(milliseconds: 160),
                        () {
                          if (!parentContext.mounted) return;
                          showJobDetailSheet(
                            parentContext,
                            api: api,
                            session: session,
                            config: config,
                            jobId: jobId,
                          );
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    ),
  );
}

Future<void> settleTextInput() async {
  FocusManager.instance.primaryFocus?.unfocus();
  await Future<void>.delayed(const Duration(milliseconds: 90));
}

Future<void> popDialogSafely<T>(BuildContext context, [T? result]) async {
  await settleTextInput();
  if (context.mounted) {
    Navigator.of(context).pop<T>(result);
  }
}

Future<bool> showApplyDialog(
  BuildContext context,
  RecruitmentApi api,
  int jobId, {
  String companyName = 'nhà tuyển dụng',
}) async {
  UploadFile? cv;
  var useLatestCv = false;
  var sending = false;
  final result = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Ứng tuyển công việc'),
        content: SizedBox(
          width: 520,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Lần đầu hãy tải lên CV PDF. Những lần sau bạn có thể dùng lại CV đã nộp gần nhất.',
                ),
                const SizedBox(height: 10),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: useLatestCv,
                  onChanged: sending
                      ? null
                      : (value) {
                          setState(() {
                            useLatestCv = value;
                            if (value) cv = null;
                          });
                        },
                  title: const Text('Dùng lại CV đã nộp gần nhất'),
                  subtitle: const Text(
                    'Áp dụng khi bạn đã từng ứng tuyển bằng PDF.',
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: sending || useLatestCv
                        ? null
                        : () async {
                            final file = await pickUploadFile(
                              'cv',
                              extensions: ['pdf'],
                            );
                            if (file != null) setState(() => cv = file);
                          },
                    icon: const Icon(Icons.attach_file),
                    label: Text(
                      cv?.name ?? 'Chọn file PDF CV',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: sending ? null : () => popDialogSafely(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: sending || (cv == null && !useLatestCv)
                ? null
                : () async {
                    setState(() => sending = true);
                    try {
                      await api.applyJob(
                        jobId,
                        cv: cv,
                        useLatestCv: useLatestCv,
                      );
                      await popDialogSafely(context, true);
                    } catch (error) {
                      showSnack(context, error.toString(), isError: true);
                      setState(() => sending = false);
                    }
                  },
            child: Text(sending ? 'Đang gửi...' : 'Ứng tuyển'),
          ),
        ],
      ),
    ),
  );
  if (result == true) {
    showSnack(context, 'Đã gửi đơn ứng tuyển thành công tới $companyName.');
  }
  return result == true;
}

class ProfileSection {
  const ProfileSection(this.key, this.label, this.fields, this.icon);

  final String key;
  final String label;
  final List<FieldSpec> fields;
  final IconData icon;

  String titleOf(Map<String, dynamic> item) {
    for (final key in ['name', 'school', 'organization', 'role', 'company']) {
      final value = textOf(item[key]);
      if (value.isNotEmpty) return value;
    }
    return label;
  }

  String subtitleOf(Map<String, dynamic> item) {
    final values = <String>[];
    for (final key in [
      'major',
      'company',
      'role',
      'technologies',
      'description',
      'link',
      'start_date',
      'end_date',
      'receive_date',
    ]) {
      final value = textOf(item[key]);
      if (value.isNotEmpty) values.add(value);
    }
    return values.take(3).join(' • ');
  }
}

class FieldSpec {
  const FieldSpec(
    this.key,
    this.label, {
    this.maxLines = 1,
    this.number = false,
    this.boolean = false,
    this.options,
  });

  final String key;
  final String label;
  final int maxLines;
  final bool number;
  final bool boolean;
  final List<String>? options;
}

const profileSections = [
  ProfileSection('educations', 'Học vấn', [
    FieldSpec('school', 'Trường'),
    FieldSpec('major', 'Chuyên ngành'),
    FieldSpec('description', 'Trình độ học vấn', options: kEducationOptions),
    FieldSpec('start_date', 'Ngày bắt đầu YYYY-MM-DD'),
    FieldSpec('end_date', 'Ngày kết thúc YYYY-MM-DD'),
  ], Icons.school_outlined),
  ProfileSection('experiences', 'Kinh nghiệm', [
    FieldSpec('name', 'Vị trí'),
    FieldSpec('company', 'Công ty'),
    FieldSpec('start_date', 'Ngày bắt đầu YYYY-MM-DD'),
    FieldSpec('end_date', 'Ngày kết thúc YYYY-MM-DD'),
    FieldSpec('description', 'Mô tả', maxLines: 3),
  ], Icons.work_history_outlined),
  ProfileSection('skills', 'Kỹ năng', [
    FieldSpec('name', 'Tên kỹ năng'),
  ], Icons.psychology_outlined),
  ProfileSection('projects', 'Dự án', [
    FieldSpec('link', 'Link Git / dự án'),
  ], Icons.rocket_launch_outlined),
  ProfileSection('certificates', 'Chứng chỉ', [
    FieldSpec('name', 'Tên chứng chỉ'),
    FieldSpec('receive_date', 'Ngày nhận YYYY-MM-DD'),
    FieldSpec('expire_date', 'Ngày hết hạn YYYY-MM-DD'),
  ], Icons.workspace_premium_outlined),
  ProfileSection('prizes', 'Giải thưởng', [
    FieldSpec('name', 'Tên giải thưởng'),
    FieldSpec('receive_date', 'Ngày nhận YYYY-MM-DD'),
  ], Icons.emoji_events_outlined),
  ProfileSection('activities', 'Hoạt động', [
    FieldSpec('organization', 'Tổ chức'),
    FieldSpec('role', 'Vai trò'),
    FieldSpec('is_present', 'Đang tham gia', boolean: true),
    FieldSpec('start_date', 'Ngày bắt đầu YYYY-MM-DD'),
    FieldSpec('end_date', 'Ngày kết thúc YYYY-MM-DD'),
    FieldSpec('description', 'Mô tả', maxLines: 3),
    FieldSpec('link', 'Liên kết'),
  ], Icons.volunteer_activism_outlined),
  ProfileSection('others', 'Thông tin khác', [
    FieldSpec('name', 'Tiêu đề'),
    FieldSpec('description', 'Mô tả', maxLines: 4),
  ], Icons.more_horiz),
];

Future<List<String>?> showCandidateSkillPickerDialog(
  BuildContext context,
  List<Map<String, dynamic>> allSkills,
  List<Map<String, dynamic>> currentSkills,
) async {
  final selected = currentSkills
      .map((item) => textOf(item['name']).toLowerCase())
      .where((name) => name.isNotEmpty)
      .toSet();

  return showDialog<List<String>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Kỹ năng ứng viên'),
        content: SizedBox(
          width: 560,
          child: SingleChildScrollView(
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final skill in allSkills)
                  FilterChip(
                    label: Text(textOf(skill['name'])),
                    selected: selected.contains(
                      textOf(skill['name']).toLowerCase(),
                    ),
                    onSelected: (value) {
                      final name = textOf(skill['name']).toLowerCase();
                      if (name.isEmpty) return;
                      setState(() {
                        value ? selected.add(name) : selected.remove(name);
                      });
                    },
                  ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<List<String>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final names = allSkills
                  .map((skill) => textOf(skill['name']))
                  .where((name) => selected.contains(name.toLowerCase()))
                  .toList();
              popDialogSafely(context, names);
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );
}

Future<SectionDialogResult?> showSectionDialog(
  BuildContext context,
  ProfileSection section,
  Map<String, dynamic>? item,
) async {
  final controllers = {
    for (final field in section.fields.where((field) => !field.boolean))
      field.key: TextEditingController(text: textOf(item?[field.key])),
  };
  for (final field in section.fields.where((field) => field.options != null)) {
    final current = controllers[field.key]!.text;
    if (!field.options!.contains(current)) {
      controllers[field.key]!.text = field.options!.first;
    }
  }
  final boolValues = {
    for (final field in section.fields.where((field) => field.boolean))
      field.key: boolValue(item?[field.key]),
  };
  UploadFile? image;
  final result = await showDialog<SectionDialogResult>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text(
          item == null
              ? 'Thêm ${section.label.toLowerCase()}'
              : 'Sửa ${section.label.toLowerCase()}',
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final field in section.fields)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: field.boolean
                      ? CheckboxListTile(
                          value: boolValues[field.key] ?? false,
                          onChanged: (value) => setState(
                            () => boolValues[field.key] = value ?? false,
                          ),
                          title: Text(field.label),
                        )
                      : field.options != null
                      ? DropdownButtonFormField<String>(
                          initialValue:
                              field.options!.contains(
                                controllers[field.key]!.text,
                              )
                              ? controllers[field.key]!.text
                              : field.options!.first,
                          isExpanded: true,
                          decoration: InputDecoration(labelText: field.label),
                          items: [
                            for (final item in field.options!)
                              DropdownMenuItem(value: item, child: Text(item)),
                          ],
                          onChanged: (value) {
                            controllers[field.key]!.text = value ?? '';
                          },
                        )
                      : TextField(
                          controller: controllers[field.key],
                          maxLines: field.maxLines,
                          keyboardType: field.number
                              ? TextInputType.number
                              : TextInputType.text,
                          decoration: InputDecoration(labelText: field.label),
                        ),
                ),
              if (section.key == 'certificates' || section.key == 'prizes')
                OutlinedButton.icon(
                  onPressed: () async {
                    final file = await pickUploadFile(
                      'image',
                      extensions: ['jpg', 'jpeg', 'png', 'webp'],
                    );
                    if (file != null) setState(() => image = file);
                  },
                  icon: const Icon(Icons.image_outlined),
                  label: Text(image?.name ?? 'Chọn ảnh minh chứng'),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<SectionDialogResult>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final fields = <String, dynamic>{};
              for (final field in section.fields) {
                if (field.boolean) {
                  fields[field.key] = boolValues[field.key] == true ? 1 : 0;
                } else {
                  final value = controllers[field.key]!.text.trim();
                  fields[field.key] = field.number && value.isNotEmpty
                      ? int.tryParse(value)
                      : value;
                }
              }
              popDialogSafely(context, SectionDialogResult(fields, image));
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  for (final controller in controllers.values) {
    controller.dispose();
  }
  return result;
}

class SectionDialogResult {
  SectionDialogResult(this.fields, this.image);
  final Map<String, dynamic> fields;
  final UploadFile? image;
}

class CandidatePersonalResult {
  CandidatePersonalResult(this.fields, this.image);
  final Map<String, dynamic> fields;
  final UploadFile? image;
}

Future<CandidatePersonalResult?> showCandidatePersonalDialog(
  BuildContext context,
  RecruitmentApi api,
  ApiConfig config,
  Map<String, dynamic> personal,
) async {
  final specs = [
    const FieldSpec('lastname', 'Họ'),
    const FieldSpec('firstname', 'Tên'),
    const FieldSpec('gender', 'Giới tính 1 nam, 0 nữ', number: true),
    const FieldSpec('dob', 'Ngày sinh YYYY-MM-DD'),
    const FieldSpec('phone', 'Điện thoại'),
    const FieldSpec('email', 'Email'),
    const FieldSpec('address', 'Địa chỉ'),
    const FieldSpec('map_lat', 'Vĩ độ', number: true),
    const FieldSpec('map_lng', 'Kinh độ', number: true),
    const FieldSpec('link', 'Liên kết'),
    const FieldSpec('objective', 'Mục tiêu nghề nghiệp', maxLines: 4),
  ];
  final controllers = {
    for (final spec in specs)
      spec.key: TextEditingController(text: textOf(personal[spec.key])),
  };
  UploadFile? image;
  var deleteImage = false;
  final mapUrl = TextEditingController();
  var resolving = false;
  final result = await showDialog<CandidatePersonalResult>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Thông tin cá nhân'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final spec in specs)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TextField(
                    controller: controllers[spec.key],
                    maxLines: spec.maxLines,
                    keyboardType: spec.number
                        ? TextInputType.number
                        : TextInputType.text,
                    decoration: InputDecoration(labelText: spec.label),
                  ),
                ),
              TextField(
                controller: mapUrl,
                decoration: InputDecoration(
                  labelText: 'Link chia sẻ Google Maps',
                  helperText:
                      'Dùng để tự lấy tọa độ hồ sơ, không cần nhập vĩ độ/kinh độ thủ công.',
                  suffixIcon: IconButton(
                    tooltip: 'Lấy tọa độ',
                    onPressed: resolving
                        ? null
                        : () async {
                            if (mapUrl.text.trim().isEmpty) return;
                            setState(() => resolving = true);
                            try {
                              final resolved = await api
                                  .resolveCandidateMapLink(mapUrl.text.trim());
                              controllers['map_lat']!.text = textOf(
                                resolved['lat'],
                              );
                              controllers['map_lng']!.text = textOf(
                                resolved['lng'],
                              );
                              showSnack(
                                context,
                                'Đã lấy tọa độ từ Google Maps.',
                              );
                            } catch (error) {
                              showSnack(
                                context,
                                error.toString(),
                                isError: true,
                              );
                            } finally {
                              setState(() => resolving = false);
                            }
                          },
                    icon: resolving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.my_location_outlined),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final file = await pickUploadFile(
                          'image',
                          extensions: ['jpg', 'jpeg', 'png', 'webp'],
                        );
                        if (file != null) setState(() => image = file);
                      },
                      icon: const Icon(Icons.image_outlined),
                      label: Text(image?.name ?? 'Chọn avatar'),
                    ),
                  ),
                ],
              ),
              CheckboxListTile(
                value: deleteImage,
                onChanged: (value) =>
                    setState(() => deleteImage = value ?? false),
                title: const Text('Xóa avatar hiện tại'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<CandidatePersonalResult>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final fields = <String, dynamic>{};
              for (final spec in specs) {
                fields[spec.key] = controllers[spec.key]!.text.trim();
              }
              fields['delete_img'] = deleteImage ? 1 : 0;
              popDialogSafely(context, CandidatePersonalResult(fields, image));
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  for (final controller in controllers.values) {
    controller.dispose();
  }
  mapUrl.dispose();
  return result;
}

Future<Map<String, dynamic>?> showBranchDialog(
  BuildContext context,
  RecruitmentApi api,
  Map<String, dynamic>? branch,
) async {
  final controllers = {
    'name': TextEditingController(text: textOf(branch?['name'])),
    'address': TextEditingController(text: textOf(branch?['address'])),
    'contact_name': TextEditingController(
      text: textOf(branch?['contact_name']),
    ),
    'phone': TextEditingController(text: textOf(branch?['phone'])),
    'email': TextEditingController(text: textOf(branch?['email'])),
    'map_lat': TextEditingController(text: textOf(branch?['map_lat'])),
    'map_lng': TextEditingController(text: textOf(branch?['map_lng'])),
  };
  final mapUrl = TextEditingController();
  var isActive = branch == null ? true : boolValue(branch['is_active']);
  var resolving = false;

  final result = await showDialog<Map<String, dynamic>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text(branch == null ? 'Thêm chi nhánh' : 'Cập nhật chi nhánh'),
        content: SizedBox(
          width: 560,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                textField(
                  controllers['name']!,
                  'Tên chi nhánh',
                  validator: requiredValidator,
                ),
                const SizedBox(height: 10),
                ResponsiveFormRow(
                  children: [
                    textField(controllers['contact_name']!, 'Người liên hệ'),
                    textField(
                      controllers['phone']!,
                      'Điện thoại',
                      keyboardType: TextInputType.phone,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                textField(
                  controllers['email']!,
                  'Email chi nhánh',
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: mapUrl,
                  decoration: InputDecoration(
                    labelText: 'Link chia sẻ Google Maps',
                    helperText:
                        'Dán link maps.app.goo.gl hoặc google.com/maps để tự lấy tọa độ.',
                    suffixIcon: IconButton(
                      tooltip: 'Lấy tọa độ',
                      onPressed: resolving
                          ? null
                          : () async {
                              if (mapUrl.text.trim().isEmpty) return;
                              setState(() => resolving = true);
                              try {
                                final resolved = await api
                                    .resolveEmployerMapLink(mapUrl.text.trim());
                                controllers['map_lat']!.text = textOf(
                                  resolved['lat'],
                                );
                                controllers['map_lng']!.text = textOf(
                                  resolved['lng'],
                                );
                                controllers['address']!.text = textOf(
                                  resolved['address'],
                                  controllers['address']!.text,
                                );
                                showSnack(
                                  context,
                                  'Đã lấy tọa độ từ Google Maps.',
                                );
                              } catch (error) {
                                showSnack(
                                  context,
                                  error.toString(),
                                  isError: true,
                                );
                              } finally {
                                setState(() => resolving = false);
                              }
                            },
                      icon: resolving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.my_location_outlined),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                if (controllers['address']!.text.trim().isNotEmpty)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        controllers['address']!.text.trim(),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Wrap(
                    spacing: 8,
                    children: [
                      Chip(
                        label: Text(
                          'Vĩ độ: ${textOf(controllers['map_lat']!.text, 'chưa có')}',
                        ),
                      ),
                      Chip(
                        label: Text(
                          'Kinh độ: ${textOf(controllers['map_lng']!.text, 'chưa có')}',
                        ),
                      ),
                    ],
                  ),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: isActive,
                  onChanged: (value) => setState(() => isActive = value),
                  title: const Text('Chi nhánh đang hoạt động'),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<Map<String, dynamic>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              popDialogSafely(context, {
                'name': controllers['name']!.text.trim(),
                'address': controllers['address']!.text.trim().isNotEmpty
                    ? controllers['address']!.text.trim()
                    : 'Tọa độ: ${controllers['map_lat']!.text.trim()}, ${controllers['map_lng']!.text.trim()}',
                'contact_name': controllers['contact_name']!.text.trim(),
                'phone': controllers['phone']!.text.trim(),
                'email': controllers['email']!.text.trim(),
                'map_lat': controllers['map_lat']!.text.trim(),
                'map_lng': controllers['map_lng']!.text.trim(),
                'is_active': isActive,
              });
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );

  await settleTextInput();
  for (final controller in [...controllers.values, mapUrl]) {
    controller.dispose();
  }
  return result;
}

Future<Map<String, dynamic>?> showMemberDialog(
  BuildContext context, {
  required List<Map<String, dynamic>> branches,
  required String actorRole,
  Map<String, dynamic>? member,
}) async {
  final user = asMap(member?['user']);
  final controllers = {
    'email': TextEditingController(text: textOf(user['email'])),
    'password': TextEditingController(),
    'name': TextEditingController(text: textOf(member?['name'])),
    'phone': TextEditingController(text: textOf(member?['phone'])),
  };
  final roles = actorRole == 'company_owner'
      ? ['branch_manager', 'branch_hr']
      : ['branch_hr'];
  var role = textOf(member?['role'], roles.first);
  if (!roles.contains(role)) role = roles.first;
  var branchId =
      intValue(member?['branch_id']) ?? intValue(branches.firstOrNull?['id']);
  var status = textOf(member?['status'], 'active');

  final result = await showDialog<Map<String, dynamic>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text(member == null ? 'Tạo tài khoản HR' : 'Cập nhật tài khoản'),
        content: SizedBox(
          width: 520,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (member == null) ...[
                  textField(
                    controllers['email']!,
                    'Email đăng nhập',
                    keyboardType: TextInputType.emailAddress,
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                ],
                textField(
                  controllers['name']!,
                  'Họ tên',
                  validator: requiredValidator,
                ),
                const SizedBox(height: 10),
                ResponsiveFormRow(
                  children: [
                    textField(
                      controllers['phone']!,
                      'Điện thoại',
                      keyboardType: TextInputType.phone,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: role,
                  decoration: const InputDecoration(labelText: 'Vai trò'),
                  items: [
                    for (final item in roles)
                      DropdownMenuItem(
                        value: item,
                        child: Text(memberRoleText(item)),
                      ),
                  ],
                  onChanged: (value) => setState(() => role = value ?? role),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<int>(
                  initialValue: branchId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Chi nhánh'),
                  items: [
                    for (final branch in branches)
                      DropdownMenuItem(
                        value: intValue(branch['id']),
                        child: Text(textOf(branch['name'])),
                      ),
                  ],
                  onChanged: (value) => setState(() => branchId = value),
                ),
                const SizedBox(height: 10),
                textField(
                  controllers['password']!,
                  member == null
                      ? 'Mật khẩu (bỏ trống để tự sinh)'
                      : 'Mật khẩu mới (nếu cần đổi)',
                  obscureText: true,
                ),
                const SizedBox(height: 10),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: 'active',
                      label: Text('Hoạt động'),
                      icon: Icon(Icons.check_circle_outline),
                    ),
                    ButtonSegment(
                      value: 'inactive',
                      label: Text('Khóa'),
                      icon: Icon(Icons.lock_outline),
                    ),
                  ],
                  selected: {status},
                  onSelectionChanged: (value) =>
                      setState(() => status = value.first),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<Map<String, dynamic>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final data = <String, dynamic>{
                'name': controllers['name']!.text.trim(),
                'phone': controllers['phone']!.text.trim(),
                'role': role,
                'branch_id': branchId,
                'status': status,
              };
              if (member == null) {
                data['email'] = controllers['email']!.text.trim();
              }
              if (controllers['password']!.text.trim().isNotEmpty) {
                data['password'] = controllers['password']!.text.trim();
              }
              popDialogSafely(context, data);
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );

  await settleTextInput();
  for (final controller in controllers.values) {
    controller.dispose();
  }
  return result;
}

class EmployerProfileResult {
  EmployerProfileResult(this.fields, this.logo, this.image);
  final Map<String, dynamic> fields;
  final UploadFile? logo;
  final UploadFile? image;
}

Future<EmployerProfileResult?> showEmployerProfileDialog(
  BuildContext context,
  RecruitmentApi api,
  ApiConfig config,
  Map<String, dynamic> employer,
) async {
  final specs = [
    const FieldSpec('name', 'Tên công ty'),
    const FieldSpec('address', 'Địa chỉ'),
    const FieldSpec('map_lat', 'Vĩ độ', number: true),
    const FieldSpec('map_lng', 'Kinh độ', number: true),
    const FieldSpec('contact_name', 'Người liên hệ'),
    const FieldSpec('phone', 'Điện thoại'),
    const FieldSpec('website', 'Website'),
    const FieldSpec('min_employees', 'Nhân sự từ', number: true),
    const FieldSpec('max_employees', 'Nhân sự đến', number: true),
    const FieldSpec('description', 'Mô tả công ty', maxLines: 5),
  ];
  final controllers = {
    for (final spec in specs)
      spec.key: TextEditingController(text: textOf(employer[spec.key])),
  };
  UploadFile? logo;
  UploadFile? image;
  final mapUrl = TextEditingController();
  var resolving = false;
  final result = await showDialog<EmployerProfileResult>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Cập nhật công ty'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final spec in specs)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TextField(
                    controller: controllers[spec.key],
                    maxLines: spec.maxLines,
                    keyboardType: spec.number
                        ? TextInputType.number
                        : TextInputType.text,
                    decoration: InputDecoration(labelText: spec.label),
                  ),
                ),
              TextField(
                controller: mapUrl,
                decoration: InputDecoration(
                  labelText: 'Link chia sẻ Google Maps',
                  helperText:
                      'Dán link Google Maps để tự cập nhật tọa độ trụ sở.',
                  suffixIcon: IconButton(
                    tooltip: 'Lấy tọa độ',
                    onPressed: resolving
                        ? null
                        : () async {
                            if (mapUrl.text.trim().isEmpty) return;
                            setState(() => resolving = true);
                            try {
                              final resolved = await api.resolveEmployerMapLink(
                                mapUrl.text.trim(),
                              );
                              controllers['map_lat']!.text = textOf(
                                resolved['lat'],
                              );
                              controllers['map_lng']!.text = textOf(
                                resolved['lng'],
                              );
                              showSnack(
                                context,
                                'Đã lấy tọa độ từ Google Maps.',
                              );
                            } catch (error) {
                              showSnack(
                                context,
                                error.toString(),
                                isError: true,
                              );
                            } finally {
                              setState(() => resolving = false);
                            }
                          },
                    icon: resolving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.my_location_outlined),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ResponsiveButtonGroup(
                stretchBelow: 520,
                children: [
                  OutlinedButton.icon(
                    onPressed: () async {
                      final file = await pickUploadFile(
                        'logo',
                        extensions: ['jpg', 'jpeg', 'png', 'webp'],
                      );
                      if (file != null) setState(() => logo = file);
                    },
                    icon: const Icon(Icons.badge_outlined),
                    label: Text(
                      logo?.name ?? 'Logo',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final file = await pickUploadFile(
                        'image',
                        extensions: ['jpg', 'jpeg', 'png', 'webp'],
                      );
                      if (file != null) setState(() => image = file);
                    },
                    icon: const Icon(Icons.image_outlined),
                    label: Text(
                      image?.name ?? 'Ảnh bìa',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<EmployerProfileResult>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              popDialogSafely(
                context,
                EmployerProfileResult(
                  {
                    for (final spec in specs)
                      spec.key: controllers[spec.key]!.text.trim(),
                  },
                  logo,
                  image,
                ),
              );
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  for (final controller in controllers.values) {
    controller.dispose();
  }
  mapUrl.dispose();
  return result;
}

Future<Map<String, dynamic>?> showJobFormDialog(
  BuildContext context, {
  Map<String, dynamic>? job,
  required RecruitmentApi api,
  required List<Map<String, dynamic>> jtypes,
  required List<Map<String, dynamic>> jlevels,
  required List<Map<String, dynamic>> industries,
  required List<Map<String, dynamic>> branches,
  required List<Map<String, dynamic>> skills,
  required List<Map<String, dynamic>> selectedSkills,
}) async {
  final controllers = {
    'jname': TextEditingController(text: textOf(job?['jname'])),
    'amount': TextEditingController(text: textOf(job?['amount'])),
    'min_salary': TextEditingController(text: textOf(job?['min_salary'])),
    'max_salary': TextEditingController(text: textOf(job?['max_salary'])),
    'yoe': TextEditingController(text: textOf(job?['yoe'])),
    'gender': TextEditingController(text: textOf(job?['gender'])),
    'expire_at': TextEditingController(text: textOf(job?['expire_at'])),
    'description': TextEditingController(text: textOf(job?['description'])),
    'requirements': TextEditingController(text: textOf(job?['requirements'])),
    'benefits': TextEditingController(text: textOf(job?['benefits'])),
    'education_level': TextEditingController(
      text: textOf(job?['education_level']),
    ),
    'required_languages': TextEditingController(
      text: textOf(job?['required_languages']),
    ),
    'required_certificates': TextEditingController(
      text: textOf(job?['required_certificates']),
    ),
    'special_address': TextEditingController(
      text: textOf(job?['special_address']),
    ),
    'map_lat': TextEditingController(text: textOf(job?['map_lat'])),
    'map_lng': TextEditingController(text: textOf(job?['map_lng'])),
  };
  var jtypeId =
      intValue(job?['jtype_id']) ?? intValue(jtypes.firstOrNull?['id']);
  var jlevelId =
      intValue(job?['jlevel_id']) ?? intValue(jlevels.firstOrNull?['id']);
  var branchId =
      intValue(job?['branch_id']) ??
      intValue(asMap(job?['branch'])['id']) ??
      intValue(branches.firstOrNull?['id']);
  var workLocationType = textOf(job?['work_location_type'], 'onsite');
  var status = textOf(
    job?['status'],
    boolValue(job?['is_active']) ? 'active' : 'active',
  );
  final industryIds = listFromResponse(
    job ?? {},
    key: 'industries',
  ).map((e) => intValue(e['id'])).whereType<int>().toSet();
  final requiredSkillIds = selectedSkills
      .where(
        (skill) =>
            textOf(asMap(skill['pivot'])['requirement_type'], 'required') ==
            'required',
      )
      .map((e) => intValue(e['id']))
      .whereType<int>()
      .toSet();
  final preferredSkillIds = selectedSkills
      .where(
        (skill) =>
            textOf(asMap(skill['pivot'])['requirement_type']) == 'preferred',
      )
      .map((e) => intValue(e['id']))
      .whereType<int>()
      .toSet();
  final mapUrl = TextEditingController();
  final formKey = GlobalKey<FormState>();
  final educationChoices = <String>{
    ...kEducationOptions,
    if (textOf(job?['education_level']).isNotEmpty)
      textOf(job?['education_level']),
  }.toList();
  final languageChoices = <String>{
    ...kLanguageOptions,
    if (textOf(job?['required_languages']).isNotEmpty)
      textOf(job?['required_languages']),
  }.toList();
  var educationLevel = textOf(job?['education_level'], kEducationOptions.first);
  var requiredLanguage = textOf(
    job?['required_languages'],
    kLanguageOptions.first,
  );
  if (!educationChoices.contains(educationLevel)) {
    educationChoices.add(educationLevel);
  }
  if (!languageChoices.contains(requiredLanguage)) {
    languageChoices.add(requiredLanguage);
  }
  var submitted = false;
  var resolving = false;

  final result = await showDialog<Map<String, dynamic>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text(job == null ? 'Tạo tin tuyển dụng' : 'Sửa tin tuyển dụng'),
        content: SizedBox(
          width: 680,
          child: Form(
            key: formKey,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  textField(
                    controllers['jname']!,
                    'Chức danh / vị trí',
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      DropdownButtonFormField<int>(
                        initialValue: jtypeId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Hình thức làm việc',
                        ),
                        items: [
                          for (final item in jtypes)
                            DropdownMenuItem(
                              value: intValue(item['id']),
                              child: Text(
                                textOf(item['name']),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                        validator: (value) =>
                            value == null ? 'Chọn hình thức làm việc' : null,
                        onChanged: (value) => setState(() => jtypeId = value),
                      ),
                      DropdownButtonFormField<int>(
                        initialValue: jlevelId,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Cấp bậc'),
                        items: [
                          for (final item in jlevels)
                            DropdownMenuItem(
                              value: intValue(item['id']),
                              child: Text(
                                textOf(item['name']),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                        validator: (value) =>
                            value == null ? 'Chọn cấp bậc' : null,
                        onChanged: (value) => setState(() => jlevelId = value),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<int>(
                    initialValue: branchId,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      labelText: 'Chi nhánh phụ trách',
                    ),
                    items: [
                      for (final item in branches)
                        DropdownMenuItem(
                          value: intValue(item['id']),
                          child: Text(textOf(item['name'])),
                        ),
                    ],
                    validator: (value) =>
                        value == null ? 'Chọn chi nhánh phụ trách' : null,
                    onChanged: (value) => setState(() => branchId = value),
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      DropdownButtonFormField<String>(
                        initialValue: workLocationType,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Địa điểm làm việc',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'onsite',
                            child: Text('Tại chi nhánh'),
                          ),
                          DropdownMenuItem(
                            value: 'hybrid',
                            child: Text('Hybrid'),
                          ),
                          DropdownMenuItem(
                            value: 'remote',
                            child: Text('Remote'),
                          ),
                          DropdownMenuItem(
                            value: 'special',
                            child: Text('Địa điểm khác'),
                          ),
                        ],
                        onChanged: (value) => setState(
                          () => workLocationType = value ?? 'onsite',
                        ),
                      ),
                      DropdownButtonFormField<String>(
                        initialValue: status,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Trạng thái',
                        ),
                        items: const [
                          DropdownMenuItem(value: 'draft', child: Text('Nháp')),
                          DropdownMenuItem(
                            value: 'active',
                            child: Text('Đang tuyển'),
                          ),
                          DropdownMenuItem(
                            value: 'paused',
                            child: Text('Tạm dừng'),
                          ),
                          DropdownMenuItem(
                            value: 'closed',
                            child: Text('Đã đóng'),
                          ),
                        ],
                        onChanged: (value) =>
                            setState(() => status = value ?? 'active'),
                      ),
                    ],
                  ),
                  if (workLocationType == 'special') ...[
                    const SizedBox(height: 10),
                    textField(
                      controllers['special_address']!,
                      'Địa điểm đặc biệt',
                      maxLines: 2,
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: mapUrl,
                      decoration: InputDecoration(
                        labelText: 'Link Google Maps',
                        suffixIcon: IconButton(
                          tooltip: 'Lấy tọa độ',
                          onPressed: resolving
                              ? null
                              : () async {
                                  if (mapUrl.text.trim().isEmpty) return;
                                  setState(() => resolving = true);
                                  try {
                                    final resolved = await api
                                        .resolveEmployerMapLink(
                                          mapUrl.text.trim(),
                                        );
                                    controllers['map_lat']!.text = textOf(
                                      resolved['lat'],
                                    );
                                    controllers['map_lng']!.text = textOf(
                                      resolved['lng'],
                                    );
                                    showSnack(
                                      context,
                                      'Đã lấy tọa độ từ Google Maps.',
                                    );
                                  } catch (error) {
                                    showSnack(
                                      context,
                                      error.toString(),
                                      isError: true,
                                    );
                                  } finally {
                                    setState(() => resolving = false);
                                  }
                                },
                          icon: resolving
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.my_location_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Wrap(
                        spacing: 8,
                        children: [
                          Chip(
                            label: Text(
                              'Vĩ độ: ${textOf(controllers['map_lat']!.text, 'chưa có')}',
                            ),
                          ),
                          Chip(
                            label: Text(
                              'Kinh độ: ${textOf(controllers['map_lng']!.text, 'chưa có')}',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      textField(
                        controllers['amount']!,
                        'Số lượng',
                        keyboardType: TextInputType.number,
                      ),
                      textField(
                        controllers['yoe']!,
                        'Năm kinh nghiệm',
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      textField(
                        controllers['min_salary']!,
                        'Lương từ',
                        keyboardType: TextInputType.number,
                      ),
                      textField(
                        controllers['max_salary']!,
                        'Đến',
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      textField(
                        controllers['gender']!,
                        'Giới tính 0 nữ, 1 nam, 2 không yêu cầu',
                        keyboardType: TextInputType.number,
                      ),
                      TextFormField(
                        controller: controllers['expire_at']!,
                        readOnly: true,
                        validator: requiredValidator,
                        decoration: const InputDecoration(
                          labelText: 'Hạn nộp',
                          suffixIcon: Icon(Icons.calendar_month_outlined),
                        ),
                        onTap: () async {
                          final now = DateTime.now();
                          final current =
                              parseDateInput(controllers['expire_at']!.text) ??
                              now.add(const Duration(days: 14));
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: current.isBefore(now) ? now : current,
                            firstDate: DateTime(now.year, now.month, now.day),
                            lastDate: now.add(const Duration(days: 1825)),
                          );
                          if (picked != null) {
                            setState(() {
                              controllers['expire_at']!.text = dateInput(
                                picked,
                              );
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: educationLevel,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      labelText: 'Học vấn yêu cầu',
                    ),
                    items: [
                      for (final item in educationChoices)
                        DropdownMenuItem(value: item, child: Text(item)),
                    ],
                    onChanged: (value) => setState(
                      () => educationLevel = value ?? kEducationOptions.first,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ResponsiveFormRow(
                    children: [
                      DropdownButtonFormField<String>(
                        initialValue: requiredLanguage,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Ngôn ngữ',
                        ),
                        items: [
                          for (final item in languageChoices)
                            DropdownMenuItem(value: item, child: Text(item)),
                        ],
                        onChanged: (value) => setState(
                          () => requiredLanguage =
                              value ?? kLanguageOptions.first,
                        ),
                      ),
                      textField(
                        controllers['required_certificates']!,
                        'Chứng chỉ',
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  textField(
                    controllers['description']!,
                    'Mô tả công việc',
                    maxLines: 4,
                    validator: requiredValidator,
                  ),
                  const SizedBox(height: 10),
                  textField(
                    controllers['requirements']!,
                    'Yêu cầu ứng viên',
                    maxLines: 4,
                  ),
                  const SizedBox(height: 10),
                  textField(controllers['benefits']!, 'Quyền lợi', maxLines: 4),
                  const SizedBox(height: 12),
                  MultiChoiceBlock(
                    title: 'Ngành nghề',
                    items: industries,
                    selectedIds: industryIds,
                    onChanged: (ids) => setState(() {
                      industryIds
                        ..clear()
                        ..addAll(ids);
                    }),
                  ),
                  if (submitted && industryIds.isEmpty)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Text(
                          'Chọn ít nhất 1 ngành nghề',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ),
                    ),
                  MultiChoiceBlock(
                    title: 'Kỹ năng bắt buộc',
                    items: skills,
                    selectedIds: requiredSkillIds,
                    onChanged: (ids) => setState(() {
                      requiredSkillIds
                        ..clear()
                        ..addAll(ids);
                    }),
                  ),
                  if (submitted && requiredSkillIds.isEmpty)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Text(
                          'Chọn ít nhất 1 kỹ năng bắt buộc',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ),
                    ),
                  MultiChoiceBlock(
                    title: 'Kỹ năng ưu tiên',
                    items: skills,
                    selectedIds: preferredSkillIds,
                    onChanged: (ids) => setState(() {
                      preferredSkillIds
                        ..clear()
                        ..addAll(ids);
                    }),
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<Map<String, dynamic>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              setState(() => submitted = true);
              final formValid = formKey.currentState?.validate() ?? false;
              if (!formValid ||
                  industryIds.isEmpty ||
                  requiredSkillIds.isEmpty) {
                return;
              }
              popDialogSafely(context, {
                'jname': controllers['jname']!.text.trim(),
                'branch_id': branchId,
                'jtype_id': jtypeId,
                'jlevel_id': jlevelId,
                'work_location_type': workLocationType,
                'special_address': controllers['special_address']!.text.trim(),
                'map_lat': controllers['map_lat']!.text.trim(),
                'map_lng': controllers['map_lng']!.text.trim(),
                'amount': int.tryParse(controllers['amount']!.text.trim()),
                'min_salary': nullableInt(controllers['min_salary']!.text),
                'max_salary': nullableInt(controllers['max_salary']!.text),
                'yoe': nullableInt(controllers['yoe']!.text),
                'gender': nullableInt(controllers['gender']!.text),
                'education_level': educationLevel,
                'required_languages': requiredLanguage,
                'required_certificates': controllers['required_certificates']!
                    .text
                    .trim(),
                'expire_at': controllers['expire_at']!.text.trim(),
                'description': controllers['description']!.text.trim(),
                'requirements': controllers['requirements']!.text.trim(),
                'benefits': controllers['benefits']!.text.trim(),
                'status': status,
                'industries': industryIds.toList(),
                'required_skills': requiredSkillIds.toList(),
                'preferred_skills': preferredSkillIds.toList(),
              });
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  for (final controller in controllers.values) {
    controller.dispose();
  }
  mapUrl.dispose();
  return result;
}

class MultiChoiceBlock extends StatelessWidget {
  const MultiChoiceBlock({
    super.key,
    required this.title,
    required this.items,
    required this.selectedIds,
    required this.onChanged,
  });

  final String title;
  final List<Map<String, dynamic>> items;
  final Set<int> selectedIds;
  final ValueChanged<Set<int>> onChanged;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                for (final item in items)
                  FilterChip(
                    label: Text(textOf(item['name'])),
                    selected: selectedIds.contains(intValue(item['id'])),
                    onSelected: (selected) {
                      final id = intValue(item['id']);
                      if (id == null) return;
                      final next = {...selectedIds};
                      selected ? next.add(id) : next.remove(id);
                      onChanged(next);
                    },
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

Future<Map<String, dynamic>?> showApplicationMessageDialog(
  BuildContext context,
  Map<String, dynamic> candidate,
  String actType,
  String status,
) async {
  final title = TextEditingController(
    text: actType == 'ACCEPT'
        ? 'Thông báo hồ sơ phù hợp'
        : 'Thông báo kết quả ứng tuyển',
  );
  final content = TextEditingController(
    text: defaultApplicationMessage(candidate, actType, status),
  );
  var sendMail = false;
  final result = await showDialog<Map<String, dynamic>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text(actType == 'ACCEPT' ? 'Chấp nhận hồ sơ' : 'Từ chối hồ sơ'),
        content: SizedBox(
          width: 520,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Ứng viên: ${fullName(candidate)}\nVị trí: ${textOf(candidate['jname'])}',
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: title,
                  decoration: const InputDecoration(labelText: 'Tiêu đề'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: content,
                  maxLines: 6,
                  decoration: const InputDecoration(labelText: 'Nội dung'),
                ),
                CheckboxListTile(
                  value: sendMail,
                  onChanged: (value) =>
                      setState(() => sendMail = value ?? false),
                  title: const Text('Gửi email'),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<Map<String, dynamic>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final safeTitle = title.text.trim().isEmpty
                  ? (actType == 'ACCEPT'
                        ? 'Thông báo hồ sơ phù hợp'
                        : 'Thông báo kết quả ứng tuyển')
                  : title.text.trim();
              final safeContent = content.text.trim().isEmpty
                  ? defaultApplicationMessage(candidate, actType, status)
                  : content.text.trim();
              popDialogSafely(context, {
                'title': safeTitle,
                'content': safeContent,
                'is_send_mail': sendMail,
                'step': status == 'BROWSING_INTERVIEW' ? 'step2' : 'step1',
              });
            },
            child: const Text('Gửi'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  title.dispose();
  content.dispose();
  return result;
}

Future<Map<String, dynamic>?> showContactCandidateDialog(
  BuildContext context,
  Map<String, dynamic> candidate,
  int jobId,
  List<Map<String, dynamic>> jobs,
) async {
  final job = jobs.firstWhere(
    (item) => intValue(item['id']) == jobId,
    orElse: () => {'id': jobId, 'jname': ''},
  );
  final title = TextEditingController(
    text: 'Mời ứng tuyển vị trí ${textOf(job['jname'])}'.trim(),
  );
  final content = TextEditingController(
    text:
        'Xin chào ${fullName(candidate)},\n\nChúng tôi thấy hồ sơ của bạn phù hợp với vị trí ${textOf(job['jname'], 'đang tuyển')} và muốn trao đổi thêm về cơ hội này.\n\nTrân trọng,',
  );
  var sendMail = true;
  final result = await showDialog<Map<String, dynamic>>(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Liên hệ ứng viên'),
        content: SizedBox(
          width: 520,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${fullName(candidate)}\n${textOf(candidate['email'])}'),
                const SizedBox(height: 10),
                TextField(
                  controller: title,
                  decoration: const InputDecoration(labelText: 'Tiêu đề'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: content,
                  maxLines: 7,
                  decoration: const InputDecoration(labelText: 'Nội dung'),
                ),
                CheckboxListTile(
                  value: sendMail,
                  onChanged: (value) =>
                      setState(() => sendMail = value ?? true),
                  title: const Text('Gửi email'),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => popDialogSafely<Map<String, dynamic>>(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => popDialogSafely(context, {
              'candidate_id': candidate['id'],
              'job_id': jobId,
              'title': title.text.trim(),
              'content': content.text.trim(),
              'is_send_mail': sendMail,
            }),
            child: const Text('Gửi'),
          ),
        ],
      ),
    ),
  );
  await settleTextInput();
  title.dispose();
  content.dispose();
  return result;
}

String defaultApplicationMessage(
  Map<String, dynamic> candidate,
  String actType,
  String status,
) {
  final name = fullName(candidate);
  final job = textOf(candidate['jname'], 'vị trí đã ứng tuyển');
  final isInterviewStage = status == 'BROWSING_INTERVIEW';
  if (actType == 'ACCEPT') {
    if (isInterviewStage) {
      return 'Xin chào $name,\n\nChúc mừng bạn đã vượt qua vòng phỏng vấn cho vị trí $job. Nhà tuyển dụng sẽ tiếp tục liên hệ để trao đổi bước tiếp theo.\n\nTrân trọng,';
    }
    return 'Xin chào $name,\n\nHồ sơ của bạn phù hợp với vị trí $job. Nhà tuyển dụng sẽ liên hệ để trao đổi lịch phỏng vấn và các thông tin tiếp theo.\n\nTrân trọng,';
  }
  if (isInterviewStage) {
    return 'Xin chào $name,\n\nCảm ơn bạn đã tham gia phỏng vấn vị trí $job. Hiện tại hồ sơ của bạn chưa phù hợp với nhu cầu tuyển dụng ở giai đoạn này.\n\nChúc bạn sớm tìm được cơ hội phù hợp.';
  }
  return 'Xin chào $name,\n\nCảm ơn bạn đã quan tâm và ứng tuyển vị trí $job. Hiện tại hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng ở giai đoạn này.\n\nChúc bạn sớm tìm được cơ hội phù hợp.';
}

Future<String?> showTextInputDialog(
  BuildContext context, {
  required String title,
  required String label,
  String initialValue = '',
}) async {
  final controller = TextEditingController(text: initialValue);
  final result = await showDialog<String>(
    context: context,
    barrierDismissible: false,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: label),
      ),
      actions: [
        TextButton(
          onPressed: () => popDialogSafely<String>(context),
          child: const Text('Hủy'),
        ),
        FilledButton(
          onPressed: () => popDialogSafely(context, controller.text),
          child: const Text('Lưu'),
        ),
      ],
    ),
  );
  await settleTextInput();
  controller.dispose();
  return result;
}

Future<bool> confirmDialog(BuildContext context, String message) async {
  return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Xác nhận'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => popDialogSafely(context, false),
              child: const Text('Hủy'),
            ),
            FilledButton(
              onPressed: () => popDialogSafely(context, true),
              child: const Text('Đồng ý'),
            ),
          ],
        ),
      ) ??
      false;
}

void showResumeSheet(BuildContext context, Map<String, dynamic> detail) {
  final basic = asMap(detail['basicInfor'] ?? detail);
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.86,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            textOf(basic['title'], 'CV'),
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          Text(textOf(basic['fullname'])),
          const SizedBox(height: 12),
          Text(textOf(basic['objective'])),
          const SizedBox(height: 14),
          for (final section in profileSections) ...[
            SectionHeader(title: section.label),
            for (final item in listFromResponse(detail, key: section.key))
              ListTile(
                dense: true,
                leading: Icon(section.icon),
                title: Text(section.titleOf(item)),
                subtitle: Text(section.subtitleOf(item)),
              ),
          ],
        ],
      ),
    ),
  );
}

DropdownButtonFormField<String> _simpleDropdown({
  required String label,
  required String? value,
  required List<Map<String, dynamic>> items,
  required ValueChanged<String?> onChanged,
}) {
  return DropdownButtonFormField<String>(
    initialValue: value,
    isExpanded: true,
    decoration: InputDecoration(labelText: label),
    items: [
      const DropdownMenuItem<String>(value: null, child: Text('Tất cả')),
      for (final item in items)
        DropdownMenuItem(
          value: textOf(item['id']),
          child: Text(textOf(item['name'])),
        ),
    ],
    onChanged: onChanged,
  );
}

TextFormField textField(
  TextEditingController controller,
  String label, {
  TextInputType? keyboardType,
  String? Function(String?)? validator,
  bool obscureText = false,
  int maxLines = 1,
}) {
  return TextFormField(
    controller: controller,
    keyboardType: keyboardType,
    validator: validator,
    obscureText: obscureText,
    maxLines: maxLines,
    decoration: InputDecoration(labelText: label),
  );
}

String? requiredValidator(String? value) {
  if (value == null || value.trim().isEmpty) return 'Không được để trống';
  return null;
}

String dateInput(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '${value.year}-$month-$day';
}

DateTime? parseDateInput(String value) {
  try {
    if (value.trim().isEmpty) return null;
    return DateTime.parse(value.trim());
  } catch (_) {
    return null;
  }
}

Future<UploadFile?> pickUploadFile(
  String field, {
  List<String>? extensions,
}) async {
  final result = await FilePicker.platform.pickFiles(
    allowMultiple: false,
    withData: true,
    type: extensions == null ? FileType.any : FileType.custom,
    allowedExtensions: extensions,
  );
  if (result == null ||
      result.files.isEmpty ||
      result.files.first.bytes == null) {
    return null;
  }
  final file = result.files.first;
  return UploadFile(field: field, name: file.name, bytes: file.bytes!);
}

void showSnack(BuildContext context, String message, {bool isError = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: isError ? Colors.red.shade700 : const Color(0xFF0F766E),
      behavior: SnackBarBehavior.floating,
    ),
  );
}

Future<void> launchExternal(String url) async {
  if (url.trim().isEmpty) return;
  final uri = Uri.tryParse(url.trim());
  if (uri == null) return;
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

Future<void> openMapLocation({
  required double lat,
  required double lng,
  String? label,
}) async {
  final query = Uri.encodeComponent(
    label == null || label.trim().isEmpty
        ? '$lat,$lng'
        : '${label.trim()}@$lat,$lng',
  );
  await launchExternal(
    'https://www.google.com/maps/search/?api=1&query=$query',
  );
}

Future<void> openPdfViewer(
  BuildContext context,
  ApiConfig config,
  String rawUrl, {
  String title = 'CV đã nộp',
}) async {
  final url = config.resolveAssetUrl(rawUrl);
  if (url.isEmpty || Uri.tryParse(url) == null) {
    showSnack(context, 'Không tìm thấy đường dẫn CV.', isError: true);
    return;
  }
  await Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => PdfViewerScreen(title: title, url: url),
    ),
  );
}

class PdfViewerScreen extends StatefulWidget {
  const PdfViewerScreen({super.key, required this.title, required this.url});

  final String title;
  final String url;

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  String _error = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            tooltip: 'Mở bằng trình duyệt',
            onPressed: () => launchExternal(widget.url),
            icon: const Icon(Icons.open_in_new),
          ),
        ],
      ),
      body: _error.isNotEmpty
          ? Padding(
              padding: const EdgeInsets.all(16),
              child: ErrorPanel(
                message: _error,
                onRetry: () => setState(() => _error = ''),
              ),
            )
          : SfPdfViewer.network(
              widget.url,
              canShowScrollHead: true,
              canShowScrollStatus: true,
              onDocumentLoadFailed: (details) {
                setState(() {
                  _error =
                      'Không mở được CV trong app.\n${details.error}\n${details.description}';
                });
              },
            ),
    );
  }
}

Map<String, dynamic> asMap(dynamic value) {
  if (value is Map) {
    return value.map((key, dynamic value) => MapEntry(key.toString(), value));
  }
  return {};
}

List<Map<String, dynamic>> listFromResponse(dynamic value, {String? key}) {
  final source = key == null ? value : asMap(value)[key];
  if (source is List) return source.map(asMap).toList();
  if (source is Iterable) return source.map(asMap).toList();
  return [];
}

List<dynamic> listFromAny(dynamic value) {
  if (value is List) return value;
  if (value is Iterable) return value.toList();
  return [];
}

String textOf(dynamic value, [String fallback = '']) {
  if (value == null) return fallback;
  final text = value.toString();
  return text.isEmpty || text == 'null' ? fallback : text;
}

int? intValue(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

int? nullableInt(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) return null;
  return int.tryParse(trimmed);
}

bool boolValue(dynamic value) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  final text = value?.toString().toLowerCase();
  return text == 'true' || text == '1' || text == 'yes';
}

Map<String, dynamic> candidateFromMatch(Map<String, dynamic> item) {
  final candidate = asMap(item['candidate']);
  return candidate.isEmpty ? item : candidate;
}

List<String> matchReasons(Map<String, dynamic> item) => listFromAny(
  item['reasons'],
).map((value) => textOf(value)).where((value) => value.isNotEmpty).toList();

String fullName(Map<String, dynamic> data) {
  final name = [
    textOf(data['lastname']),
    textOf(data['firstname']),
  ].where((part) => part.isNotEmpty).join(' ');
  if (name.isNotEmpty) return name;
  return textOf(data['name'], 'Ứng viên');
}

String initialsOf(String value) {
  final parts = value
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .toList();
  if (parts.isEmpty) return 'R';
  if (parts.length == 1) return parts.first.characters.first.toUpperCase();
  return '${parts.first.characters.first}${parts.last.characters.first}'
      .toUpperCase();
}

String salaryText(Map<String, dynamic> job) {
  final min = intValue(job['min_salary']);
  final max = intValue(job['max_salary']);
  if (min == null && max == null) return 'Thỏa thuận';
  if (min != null && max != null) return '$min - $max triệu';
  if (min != null) return 'Từ $min triệu';
  return 'Đến $max triệu';
}

String employeeRange(Map<String, dynamic> employer) {
  final min = textOf(employer['min_employees']);
  final max = textOf(employer['max_employees']);
  if (min.isEmpty && max.isEmpty) return 'Chưa cập nhật';
  if (min.isNotEmpty && max.isNotEmpty) return '$min - $max';
  if (min.isNotEmpty) return 'Từ $min';
  return 'Đến $max';
}

String memberRoleText(String role) {
  return switch (role) {
    'company_owner' => 'Tổng công ty',
    'branch_manager' => 'Quản lý chi nhánh',
    'branch_hr' => 'HR chi nhánh',
    _ => role,
  };
}

String moneyText(dynamic value) {
  final amount = intValue(value);
  if (amount == null) return '0 đ';
  final raw = amount.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < raw.length; i++) {
    final fromEnd = raw.length - i;
    buffer.write(raw[i]);
    if (fromEnd > 1 && fromEnd % 3 == 1) buffer.write('.');
  }
  return '${buffer.toString()} đ';
}

String profileSectionLabel(String key) {
  return profileSections
      .firstWhere(
        (section) => section.key == key,
        orElse: () => ProfileSection(key, key, const [], Icons.circle),
      )
      .label;
}

String applicationStatusText(String status) {
  return switch (status) {
    'WAITING' => 'Chờ duyệt CV',
    'BROWSING_RESUME' => 'Đã xem CV',
    'RESUME_FAILED' => 'Loại CV',
    'BROWSING_INTERVIEW' => 'Phỏng vấn',
    'INTERVIEW_FAILED' => 'Loại phỏng vấn',
    'PASSED' => 'Đã tiếp nhận',
    _ => status,
  };
}

Icon statusIcon(String status) {
  final icon = switch (status) {
    'PASSED' => Icons.verified_outlined,
    'RESUME_FAILED' || 'INTERVIEW_FAILED' => Icons.cancel_outlined,
    'BROWSING_INTERVIEW' => Icons.event_available_outlined,
    _ => Icons.hourglass_top,
  };
  return Icon(icon);
}
