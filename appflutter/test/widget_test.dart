import 'package:appflutter/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders recruitment shell for guests', (tester) async {
    await tester.pumpWidget(
      RecruitmentApp(
        config: ApiConfig.inMemory('http://192.168.2.220:8000/api'),
        session: AuthSession.empty(),
      ),
    );

    expect(find.text('Recruitment Studio'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();

    expect(find.text('Recruitment'), findsOneWidget);
    expect(find.text('Việc làm'), findsWidgets);
    expect(find.text('Công ty'), findsWidgets);
    expect(find.text('Tài khoản'), findsOneWidget);
  });
}
